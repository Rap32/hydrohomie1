import { useMemo, useState, useEffect } from "react";
import {
  Activity, AlertTriangle, Bell, ChevronDown, CircleHelp, CloudRain, Download,
  Droplets, Gauge, LayoutDashboard, MapPinned, Menu, MessageSquareText,
  RadioTower, RefreshCw, Search, Settings, ShieldCheck, Siren, Users, X
} from "lucide-react";

const initialSensors = [
  { id: "HH-ESP32-01", name: "Kauswagan Creek — Zone 1", location: "Near Barangay Hall", level: 1.24, threshold: 1.8, status: "Normal", updated: "Just now", signal: 96 },
  { id: "HH-ESP32-02", name: "Kauswagan Creek — Zone 2", location: "Purok 3 footbridge", level: 2.08, threshold: 1.8, status: "Warning", updated: "2 min ago", signal: 88 },
  { id: "HH-ESP32-03", name: "Drainage Channel — Zone 3", location: "Lower Kauswagan", level: 0.74, threshold: 1.8, status: "Normal", updated: "3 min ago", signal: 91 },
];
const initialAlerts = [
  { id: 1, severity: "Warning", title: "Water level threshold reached", location: "Kauswagan Creek — Zone 2", time: "10:42 AM", message: "Sample alert — check local conditions before issuing a public warning." },
  { id: 2, severity: "Info", title: "Sensor heartbeat received", location: "Kauswagan Creek — Zone 1", time: "10:36 AM", message: "Sample device status event." },
  { id: 3, severity: "Critical", title: "High water level event (sample)", location: "Lower Kauswagan", time: "Yesterday", message: "Demonstration record only; not a live emergency report." },
];

function Pill({ children, tone = "gray" }) { return <span className={`pill ${tone}`}>{children}</span>; }
function StatCard({ icon: Icon, label, value, detail, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div className="stat-copy"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></article>;
}

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [sensors, setSensors] = useState(initialSensors);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [toast, setToast] = useState("");
  const [apiMode, setApiMode] = useState("demo");

  // Fetch readings from PHP API when apiMode is set to "api"
  useEffect(() => {
    if (apiMode === "api") {
      fetch("http://localhost/hydrohomie/api/readings.php")
        .then(res => res.json())
        .then(data => {
          const readings = Array.isArray(data) ? data : (data.readings || []);
          if (readings.length === 0) {
            setSensors([]);
            notify("API connected successfully, but returned 0 readings.");
          } else {
            setSensors(readings);
            notify(`Loaded ${readings.length} readings from API.`);
          }
        })
        .catch(err => {
          console.error("API fetch error:", err);
          notify("Failed to connect to PHP API endpoint.");
        });
    } else {
      setSensors(initialSensors);
    }
  }, [apiMode]);

  const nav = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Flood Monitoring", icon: MapPinned },
    { label: "Alerts & Events", icon: Bell },
    { label: "SMS Broadcasting", icon: MessageSquareText },
    { label: "Residents", icon: Users },
    { label: "Reports", icon: Activity },
    { label: "Settings", icon: Settings },
  ];
  const visibleSensors = useMemo(() => sensors.filter(s => `${s.name} ${s.location} ${s.id}`.toLowerCase().includes(search.toLowerCase())), [sensors, search]);

  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 3000); }
  function exportSensors() {
    const csv = ["Device ID,Sensor,Location,Water Level (m),Threshold (m),Status,Last Update",
      ...sensors.map(s => [s.id, `"${s.name}"`, `"${s.location}"`, s.level, s.threshold, s.status, s.updated].join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "hydrohomie-sensor-export.csv"; link.click(); URL.revokeObjectURL(link.href);
    notify("CSV exported.");
  }
  function simulateReading() {
    setSensors(prev => prev.map(s => {
      const level = Math.max(0.2, Number((s.level + (Math.random() * 0.3 - 0.12)).toFixed(2)));
      return { ...s, level, status: level >= s.threshold ? "Warning" : "Normal", updated: "Just now" };
    }));
    notify("Simulated readings updated locally.");
  }
  function acknowledge(id) {
    setAlerts(prev => prev.filter(a => a.id !== id));
    notify("Alert removed from this view.");
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Droplets size={25} /></div><div><b>HydroHomie</b><small>FLOOD MONITORING</small></div><button className="icon-btn close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="barangay-label">MONITORING AREA</div><div className="area-selector"><MapPinned size={16}/><span>Brgy. Kauswagan, CDO</span><ChevronDown size={15}/></div>
      <nav>{nav.map(item => <button key={item.label} onClick={() => {setActive(item.label); setMobileNav(false);}} className={`nav-item ${active === item.label ? "active" : ""}`}><item.icon size={18}/><span>{item.label}</span>{item.label === "Alerts & Events" && <em>{alerts.length}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="safety-card"><ShieldCheck size={20}/><b>Preparedness first</b><p>Always verify sensor data with local conditions and official responders.</p></div><div className="profile"><div className="avatar">AD</div><div><b>Administrator</b><small>{apiMode === "api" ? "Live API mode" : "Demo account"}</small></div><ChevronDown size={15}/></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21}/></button><div className="crumb">HydroHomie <span>/</span> <b>{active}</b></div><div className="top-actions"><div className="system-state"><span className="status-dot"></span><span>{apiMode === "demo" ? "Demo data" : "API mode connected"}</span></div><button className="icon-btn" onClick={() => notify("No new notifications.")} aria-label="Notifications"><Bell size={19}/><i/></button><div className="avatar top-avatar">AD</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">BARANGAY DISASTER PREPAREDNESS</div><h1>{active}</h1><p>Monitor water levels, device health, and community alerts in one place.</p></div><div className="heading-actions"><button className="btn secondary" onClick={simulateReading}><RefreshCw size={16}/> Simulate reading</button><button className="btn primary" onClick={() => setShowSensorModal(true)}><RadioTower size={16}/> Register sensor</button></div></div>
        
        {apiMode === "demo" && (
          <div className="demo-banner"><AlertTriangle size={18}/><div><b>Prototype / mock data</b><span>Values below are sample data for UI testing. Switch to API mode in Settings to connect to your PHP backend.</span></div><button onClick={() => setActive("Settings")}>Configure API</button></div>
        )}

        {active === "Dashboard" && <>
          <section className="stats-grid">
            <StatCard icon={RadioTower} label="Registered sensors" value={sensors.length} detail={apiMode === "api" ? "From MySQL / API" : "Demo devices"} tone="blue"/>
            <StatCard icon={Activity} label="Devices online" value={`${sensors.length} / ${sensors.length}`} detail="Connectivity active" tone="green"/>
            <StatCard icon={Siren} label="Active warnings" value={sensors.filter(s=>s.status!=="Normal").length} detail="Based on current readings" tone="orange"/>
            <StatCard icon={MessageSquareText} label="SMS sent today" value="0" detail="Gateway not connected" tone="purple"/>
          </section>
          <section className="dashboard-grid">
            <article className="panel sensor-panel"><div className="panel-header"><div><h2>Water level overview</h2><p>Readings from active monitoring points</p></div><button className="text-btn" onClick={() => setActive("Flood Monitoring")}>View all <span>→</span></button></div>
              <div className="sensor-list">
                {sensors.map(s => (
                  <div className="sensor-row" key={s.id}>
                    <div className="sensor-symbol"><Droplets size={19}/></div>
                    <div className="sensor-info">
                      <b>{s.name}</b>
                      <small>{s.location} · {s.id}</small>
                      <div className="level-track">
                        <span style={{ width: `${Math.min(100, (s.level / (s.threshold || 1.8)) * 100)}%`, background: s.status === "Normal" ? "#20a779" : "#e89a36" }} />
                      </div>
                    </div>
                    <div className="sensor-reading">
                      <strong>{(typeof s.level === 'number' ? s.level : parseFloat(s.level) || 0).toFixed(2)} <small>m</small></strong>
                      <Pill tone={s.status === "Normal" ? "green" : "orange"}>{s.status}</Pill>
                    </div>
                  </div>
                ))}
                {sensors.length === 0 && <div className="empty-state">No readings returned from the API endpoint.</div>}
              </div>
              <div className="panel-foot"><span><span className="legend-dot normal"></span> Normal</span><span><span className="legend-dot warning"></span> At/above warning threshold</span><small>Thresholds shown are active settings.</small></div>
            </article>
            <article className="panel readiness-panel"><div className="panel-header"><div><h2>System readiness</h2><p>Integration checklist</p></div><Gauge size={21} className="muted-icon"/></div>
              <div className="readiness-score"><div className="ring"><div><b>{apiMode === "api" ? "70%" : "35%"}</b><small>status</small></div></div><div><b>{apiMode === "api" ? "API Connected" : "UI prototype"}</b><p>{apiMode === "api" ? "Dashboard is communicating with your PHP endpoint." : "Dashboard screens are interactive. Switch to API mode in settings once your PHP backend is running."}</p></div></div>
              {[["React dashboard", true], ["PHP API", apiMode === "api"], ["MySQL database", apiMode === "api"], ["ESP32 sensor feed", false], ["SMS gateway", false]].map(([label, done])=><div className="check-row" key={label}><span className={`check ${done?"done":""}`}>{done?"✓":"•"}</span><span>{label}</span><Pill tone={done?"green":"gray"}>{done?"Ready":"Not connected"}</Pill></div>)}
            </article>
          </section>
          <section className="panel alerts-panel"><div className="panel-header"><div><h2>Recent alerts & events</h2><p>Event history for the interface</p></div><button className="text-btn" onClick={() => setActive("Alerts & Events")}>View events <span>→</span></button></div><div className="table-wrap"><table><thead><tr><th>EVENT</th><th>LOCATION</th><th>TIME</th><th>SEVERITY</th><th></th></tr></thead><tbody>{alerts.slice(0,3).map(a=><tr key={a.id}><td><div className="event-title"><span className={`event-icon ${a.severity.toLowerCase()}`}><AlertTriangle size={15}/></span><div><b>{a.title}</b><small>{a.message}</small></div></div></td><td>{a.location}</td><td>{a.time}</td><td><Pill tone={a.severity==="Critical"?"red":a.severity==="Warning"?"orange":"blue"}>{a.severity}</Pill></td><td><button className="mini-btn" onClick={() => acknowledge(a.id)}>Dismiss</button></td></tr>)}</tbody></table>{alerts.length===0&&<div className="empty-state">No alerts in this view.</div>}</div></section>
        </> }

        {active === "Flood Monitoring" && <section className="panel page-panel"><div className="panel-header"><div><h2>Monitoring points</h2><p>Live map integration view.</p></div><button className="btn secondary" onClick={exportSensors}><Download size={16}/> Export CSV</button></div><div className="map-placeholder"><div className="map-grid"></div><div className="map-center"><MapPinned size={30}/><b>Barangay Kauswagan</b><span>Map placeholder — add verified coordinates and a mapping provider.</span></div>{sensors.map((s,i)=><button className={`map-pin pin-${i}`} key={s.id} onClick={()=>setSelectedSensor(s)} title={s.name}><Droplets size={16}/></button>)}</div>{selectedSensor&&<div className="selected-device"><b>{selectedSensor.name}</b><span>{(typeof selectedSensor.level === 'number' ? selectedSensor.level : parseFloat(selectedSensor.level) || 0).toFixed(2)} m · {selectedSensor.status}</span><button className="text-btn" onClick={()=>setSelectedSensor(null)}>Close</button></div>}<SensorTable sensors={visibleSensors} search={search} setSearch={setSearch} /></section>}

        {active === "Alerts & Events" && <section className="panel page-panel"><div className="panel-header"><div><h2>Alert history</h2><p>Event list.</p></div><Pill tone="orange">{alerts.length} events</Pill></div>{alerts.map(a=><div className="alert-card" key={a.id}><div className={`event-icon ${a.severity.toLowerCase()}`}><AlertTriangle size={17}/></div><div className="alert-main"><div><b>{a.title}</b><Pill tone={a.severity==="Critical"?"red":a.severity==="Warning"?"orange":"blue"}>{a.severity}</Pill></div><p>{a.location} · {a.time}</p><small>{a.message}</small></div><button className="mini-btn" onClick={()=>acknowledge(a.id)}>Dismiss</button></div>)}</section>}

        {active === "SMS Broadcasting" && <SmsPage notify={notify}/>}
        {active === "Residents" && <section className="panel page-panel"><div className="panel-header"><div><h2>Resident directory</h2><p>Resident directory layout.</p></div><Pill>Not connected</Pill></div><div className="empty-large"><Users size={30}/><b>Resident records not connected</b><span>Connect the PHP API and create an approved resident table before using this section.</span></div></section>}
        {active === "Reports" && <section className="panel page-panel"><div className="panel-header"><div><h2>Reports</h2><p>Export current sensor readings.</p></div><button className="btn primary" onClick={exportSensors}><Download size={16}/> Export CSV</button></div><div className="report-note"><CircleHelp size={20}/><div><b>Export utility</b><p>The CSV is generated from current sensor records.</p></div></div><SensorTable sensors={visibleSensors} search={search} setSearch={setSearch}/></section>}
        {active === "Settings" && <section className="panel page-panel"><div className="panel-header"><div><h2>System settings</h2><p>Choose how the interface fetches its data source.</p></div></div><div className="setting-row"><div><b>Data source mode</b><p>Switch between sample data and your live local PHP endpoint.</p></div><select value={apiMode} onChange={e=>setApiMode(e.target.value)}><option value="demo">Demo / mock data</option><option value="api">API mode (http://localhost/hydrohomie/api/readings.php)</option></select></div><div className="setting-row"><div><b>Water-level thresholds</b><p>Threshold values configured in system settings.</p></div><button className="btn secondary" onClick={()=>notify("Threshold settings configuration.")}>Configure</button></div><div className="setting-row"><div><b>Device protocol</b><p>ESP32 sends readings to the PHP endpoint over Wi-Fi.</p></div><Pill tone={apiMode === "api" ? "green" : "gray"}>{apiMode === "api" ? "Connected / Active" : "Not configured"}</Pill></div></section>}
      </div>
      <footer className="footer"><span>HydroHomie · Admin dashboard</span><span>Verify all readings before emergency action</span></footer>
    </main>

    {showSensorModal && <div className="modal-backdrop" onClick={()=>setShowSensorModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Register sensor</h2><p>Add a device to the dashboard view.</p></div><button className="icon-btn" onClick={()=>setShowSensorModal(false)}><X size={18}/></button></div><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const id=String(f.get("id")).trim();if(sensors.some(s=>s.id===id)){notify("That device ID already exists.");return;}setSensors(prev=>[...prev,{id,name:String(f.get("name")),location:String(f.get("location")),level:0,threshold:1.8,status:"Normal",updated:"Just added",signal:0}]);setShowSensorModal(false);notify("Sensor added locally.");}}><label>Device ID<input name="id" placeholder="HH-ESP32-04" required/></label><label>Sensor name<input name="name" placeholder="Creek — Zone 4" required/></label><label>Location description<input name="location" placeholder="Near landmark / purok" required/></label><div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setShowSensorModal(false)}>Cancel</button><button type="submit" className="btn primary">Add sensor</button></div></form><small className="form-note">This adds a temporary row in the browser view.</small></div></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>;
}

function SensorTable({sensors, search, setSearch}) {
  return <><div className="table-tools"><h3>Sensor registry <small>({sensors.length})</small></h3><label className="searchbox"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sensors…"/></label></div><div className="table-wrap"><table><thead><tr><th>DEVICE</th><th>LOCATION</th><th>WATER LEVEL</th><th>THRESHOLD</th><th>STATUS</th><th>UPDATED</th></tr></thead><tbody>{sensors.map(s=><tr key={s.id}><td><b>{s.id}</b><small>{s.name}</small></td><td>{s.location}</td><td><b>{(typeof s.level === 'number' ? s.level : parseFloat(s.level) || 0).toFixed(2)} m</b></td><td>{(typeof s.threshold === 'number' ? s.threshold : parseFloat(s.threshold) || 1.8).toFixed(2)} m</td><td><Pill tone={s.status==="Normal"?"green":"orange"}>{s.status}</Pill></td><td>{s.updated}</td></tr>)}</tbody></table>{sensors.length===0&&<div className="empty-state">No sensors available.</div>}</div></>;
}

function SmsPage({notify}) {
  const [message,setMessage]=useState("HYDROHOMIE: Water level advisory for Barangay Kauswagan. Please follow official announcements.");
  const [audience,setAudience]=useState("all");
  return <section className="sms-layout"><article className="panel page-panel"><div className="panel-header"><div><h2>Compose broadcast</h2><p>SMS gateway control.</p></div><Pill tone="orange">Gateway disconnected</Pill></div><label className="field-label">Recipient group<select value={audience} onChange={e=>setAudience(e.target.value)}><option value="all">All registered residents</option><option value="zone1">Zone 1</option><option value="zone2">Zone 2</option><option value="officials">Barangay officials</option></select></label><label className="field-label">Message<textarea value={message} maxLength={320} onChange={e=>setMessage(e.target.value)} rows={6}/><span className="char-count">{message.length}/320 characters</span></label><button className="btn primary" onClick={()=>notify("SMS gateway not connected.")}><MessageSquareText size={16}/> Preview broadcast</button><p className="privacy-note"><ShieldCheck size={16}/> Test with consenting team members before deployment.</p></article><article className="panel phone-preview"><div className="panel-header"><div><h2>Message preview</h2><p>Example SMS appearance</p></div></div><div className="phone"><div className="phone-top">Messages · Now</div><div className="phone-bubble">{message || "Your message preview appears here."}</div><small>Preview only</small></div><div className="preview-meta"><span>Recipient group</span><b>{audience==="all"?"All residents":audience==="zone1"?"Zone 1":audience==="zone2"?"Zone 2":"Barangay officials"}</b><span>Estimated recipients</span><b>Database not connected</b></div></article></section>;
}