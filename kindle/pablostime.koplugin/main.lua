local WidgetContainer = require('ui/widget/container/widgetcontainer')
local UIManager = require('ui/uimanager')
local Device = require('device')
local NetworkMgr = require('ui/network/manager')
local JSON = require('json')
local DocSettings = require('docsettings')
local InfoMessage = require('ui/widget/infomessage')
local PluginShare = require('pluginshare')
local BASE = '/mnt/us/newspaper-reader'
local App = WidgetContainer:extend{name='pablostime',is_doc_only=true}
local function read(path)
    local f=io.open(path,'rb'); if not f then return nil end
    local v=f:read('*a');f:close();return v
end
local function write(path,value)
    local f=assert(io.open(path,'wb'));f:write(value);f:close()
end
local function quote(s) return "'"..s:gsub("'", "'\\''").."'" end
local function log(s)
    local f=io.open(BASE..'/wifi-reader.log','a'); if f then f:write(os.date('!%Y-%m-%dT%H:%M:%SZ')..' '..s..'\n');f:close() end
end
local function decode(path)
    local raw=read(path);if not raw then return nil end
    local ok,result=pcall(JSON.decode,raw);return ok and result or nil
end
local function shell(cmd)
    local r=os.execute(cmd);return r==0 or r==true
end
local function validManifest(m)
    if type(m)~='table' or m.version~=1 or m.width~=600 or m.height~=800 or type(m.day)~='string' or not m.day:match('^%d%d%d%d%-%d%d%-%d%d$') then return false end
    if m.revision~=nil and (type(m.revision)~='string' or #m.revision~=13 or not m.revision:match('^%d+$')) then return false end
    local key=m.day..(m.revision and '/revisions/'..m.revision or '')
    if type(m.pages)~='table' or #m.pages<1 or #m.pages>20 then return false end
    local function integrity(o,limit)
        return type(o)=='table' and type(o.bytes)=='number' and o.bytes%1==0 and o.bytes>0 and o.bytes<=limit and type(o.sha256)=='string' and #o.sha256==64 and o.sha256:match('^[a-f0-9]+$')
    end
    for i,p in ipairs(m.pages) do if not integrity(p,1500000) or p.number~=i or p.path~='/device/editions/'..key..'/page-'..i..'.png' then return false end end
    return integrity(m.bundle,31000000) and m.bundle.path=='/device/editions/'..key..'/edition.cbz' and type(m.next_delivery)=='number'
end
function App:curl(path,destination,maxsize,post)
    assert(path:sub(1,8)=='/device/' and not path:find('[\r\n]'))
    local cmd='/usr/bin/curl -q --config '..quote(BASE..'/device.curl')..' --cacert '..quote(BASE..'/cacert.pem').." --proto '=https' --tlsv1.2 --noproxy '*' --fail --silent --connect-timeout 10 --max-time 70 --max-filesize "..maxsize..' --output '..quote(destination)
    if post then cmd=cmd.." --header 'Content-Type: application/json' --data-binary @"..quote(post) end
    local status=os.execute(cmd..' '..quote(self.config.origin..path))
    local ok=status==0 or status==true
    if not ok then log('https_failed status='..tostring(status)..' manifest='..tostring(path=='/device/manifest')) end
    return ok
end
function App:receipt(m,stage,trigger)
    write(BASE..'/receipt-out.json',JSON.encode({day=m.day,revision=m.revision,stage=stage,pages=#m.pages,trigger=trigger}))
    self:curl('/device/receipt',BASE..'/receipt-response.json',4096,BASE..'/receipt-out.json')
end
function App:init()
    if (read(BASE..'/OWNER.txt') or ''):match('Kindle Newspaper reader v1')==nil then return end
    self.config=decode(BASE..'/wifi-config.json')
    if not self.config or type(self.config.origin)~='string' or not self.config.origin:match('^https://[a-zA-Z0-9%.%-]+$') then return end
    self.active=self.ui.document and self.ui.document.file:sub(1,#BASE+1)==BASE..'/'
    if not self.active then return end
    self.ui.menu:registerToMainMenu(self)
end
function App:cancelAlarm()
    if self.alarm then
        UIManager:unschedule(self.alarm)
        if Device.wakeup_mgr then Device.wakeup_mgr:removeTasks(nil,self.alarm) end
        self.alarm=nil
    end
end
function App:schedule(epoch,trigger)
    self:cancelAlarm()
    self.alarm=function()
        local fired=self.alarm
        UIManager:unschedule(fired)
        self.alarm=nil
        -- WakeupMgr removes its current task after callback; defer our cleanup.
        UIManager:nextTick(function() if Device.wakeup_mgr then Device.wakeup_mgr:removeTasks(nil,fired) end end)
        log('alarm_fired trigger='..trigger)
        local power=Device:getPowerDevice()
        local state=power.getPowerdState and power:getPowerdState()
        if state=='screenSaver' or state=='suspended' then power:toggleSuspend() end
        UIManager:scheduleIn(3,function() if not self.closed then self:sync(trigger) end end)
    end
    local delay=math.max(1,epoch-os.time())
    UIManager:scheduleIn(delay,self.alarm)
    if Device.wakeup_mgr then Device.wakeup_mgr:addTask(delay,self.alarm) end
    log('alarm_scheduled epoch='..epoch..' trigger='..trigger..' rtc='..tostring(Device.wakeup_mgr~=nil))
end
function App:scheduleNext(m)
    local test=decode(BASE..'/alarm-test.json')
    if test and test.epoch and not test.used and test.epoch>os.time() then
        self:schedule(test.epoch,'test_alarm')
    else
        local target=m.next_delivery
        if target<=os.time() then target=os.time()+300 end
        self:schedule(target,'morning_alarm')
    end
end
function App:onReaderReady()
    if not self.active then return end
    local cached=decode(BASE..'/wifi-manifest.json')
    if cached then self:scheduleNext(cached) end
    if read(BASE..'/wait-for-alarm-once') then
        os.remove(BASE..'/wait-for-alarm-once')
        log('reader_open_sync_deferred_for_alarm_test')
        return
    end
    self.startTask=function() if not self.closed then self:sync('reader_open') end end
    UIManager:scheduleIn(5,self.startTask)
end
function App:retryLater()
    self.failures=(self.failures or 0)+1
    if self.failures<=3 then self:schedule(os.time()+300,'retry')
    else
        -- CDMX is UTC-6 for this installation; use the cached server alarm when available.
        local cached=decode(BASE..'/wifi-manifest.json')
        local nextday=math.floor((os.time()-14*3600)/86400+1)*86400+14*3600
        self:schedule(cached and cached.next_delivery>os.time() and cached.next_delivery or nextday,'morning_alarm')
    end
end
function App:sync(trigger)
    if self.busy or self.closed then return end
    self.busy=true
    PluginShare.pause_auto_suspend=true
    self.watchdog=function()
        if self.busy then self.busy=false;PluginShare.pause_auto_suspend=false;log('wifi_connection_timeout');self:retryLater() end
    end
    UIManager:scheduleIn(100,self.watchdog)
    NetworkMgr:turnOnWifiAndWaitForConnection(function()
        if self.closed or not self.busy then return end
        UIManager:unschedule(self.watchdog)
        self:attemptDownload(trigger,1)
    end)
end
function App:attemptDownload(trigger,attempt)
    if self.closed or not self.busy then return end
    local ok,err=pcall(function() self:download(trigger) end)
    if ok then
        self.busy=false;PluginShare.pause_auto_suspend=false
    else
        log('sync_failed attempt='..attempt..' '..tostring(err):sub(1,180))
        if attempt<4 then
            -- Association can precede usable DNS/routes after Kindle resume.
            -- Yield to KOReader so its Wi-Fi restoration can finish.
            log('network_retry_in_15s trigger='..trigger)
            self.retryTask=function() self:attemptDownload(trigger,attempt+1) end
            UIManager:scheduleIn(15,self.retryTask)
        else
            self.busy=false;PluginShare.pause_auto_suspend=false
            self:retryLater()
        end
    end
end

function App:download(trigger)
    log('sync_started trigger='..trigger)
    assert(self:curl('/device/manifest',BASE..'/manifest-download.json',65536),'manifest download failed')
    local m=decode(BASE..'/manifest-download.json');assert(validManifest(m),'invalid manifest')
    if m.server_time then assert(math.abs(os.time()-m.server_time)<300,'Kindle clock differs from server') end
    local name='edition-'..m.day..'-'..(m.revision or 'daily')..'.cbz'
    local target=BASE..'/'..name
    local old=decode(BASE..'/wifi-manifest.json')
    write(BASE..'/cached-check.sha256',m.bundle.sha256..'  '..target..'\n')
    if not old or not old.bundle or old.bundle.sha256~=m.bundle.sha256 or not shell('/bin/busybox sha256sum -c '..quote(BASE..'/cached-check.sha256')..' >/dev/null 2>&1') then
        local part=BASE..'/edition-download.part'
        assert(self:curl(m.bundle.path,part,31000000),'edition download failed')
        local f=assert(io.open(part,'rb'));local bytes=f:seek('end');f:close();assert(bytes==m.bundle.bytes,'edition byte count mismatch')
        write(BASE..'/download.sha256',m.bundle.sha256..'  '..part..'\n')
        assert(shell('/bin/busybox sha256sum -c '..quote(BASE..'/download.sha256')..' >/dev/null 2>&1'),'edition checksum mismatch')
        assert(os.rename(part,target),'edition rename failed')
        log('download_verified pages='..#m.pages..' bytes='..bytes)
        self:receipt(m,'downloaded',trigger)
    end
    write(BASE..'/wifi-manifest.new',JSON.encode(m));assert(os.rename(BASE..'/wifi-manifest.new',BASE..'/wifi-manifest.json'))
    write(BASE..'/active.sha256',m.bundle.sha256..'  '..target..'\n')
    write(BASE..'/active-edition.new',name..'\n');assert(os.rename(BASE..'/active-edition.new',BASE..'/active-edition.txt'))
    if trigger=='test_alarm' then write(BASE..'/alarm-test.json',JSON.encode({used=true})) end
    self.failures=0
    self:scheduleNext(m)
    if self.ui.document.file~=target then
        -- Every revision is a new document: do not inherit KOReader's crop/width defaults.
        local settings=DocSettings:open(target)
        if settings:readSetting('pablostime_layout_version')~=1 then
            settings:saveSetting('zoom_mode','page')
            settings:saveSetting('kopt_page_scroll',0)
            settings:saveSetting('kopt_trim_page',0)
            settings:saveSetting('kopt_text_wrap',0)
            settings:saveSetting('page',1)
            settings:saveSetting('pablostime_layout_version',1)
            settings:flush()
        end
        local receipt=function() self:receipt(m,'opened',trigger);log('edition_opened trigger='..trigger) end
        UIManager:nextTick(function() self.ui:switchDocument(target,false,receipt) end)
    else
        if trigger=='test_alarm' or trigger=='morning_alarm' then self.ui.gotopage:onGoToBeginning() end
        self:receipt(m,'opened',trigger);log('edition_current trigger='..trigger)
    end
end
function App:addToMainMenu(items)
    items.pablostime={text="Pablo's Time",sub_item_table={
        {text='Actualizar ahora por Wi-Fi',callback=function() self:sync('manual') end},
        {text='Probar alarma en 3 minutos',callback=function()
            write(BASE..'/alarm-test.json',JSON.encode({epoch=os.time()+180,used=false}))
            self:schedule(os.time()+180,'test_alarm')
            UIManager:show(InfoMessage:new{text='Alarma en 3 minutos. Pulsa encendido una vez para suspender. No conectes USB.',timeout=8})
        end},
    }}
end
function App:onCloseDocument()
    self.closed=true;self:cancelAlarm()
    if self.startTask then UIManager:unschedule(self.startTask) end
    if self.watchdog then UIManager:unschedule(self.watchdog) end
    if self.retryTask then UIManager:unschedule(self.retryTask) end
    PluginShare.pause_auto_suspend=false
end
return App
