import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {BookOpen, CheckCircle2, CircleAlert, Clock3, FileText, FolderOpen, LayoutDashboard, Plus, Search, CalendarDays, Trash2, Pencil, X, Upload, ChevronRight, LockKeyhole, ArrowRight, Eye, EyeOff, LogOut} from "lucide-react";
import "./styles.css";

const seedSubjects = [
  {id: "s1", name: "Business Finance", code: "FIN 101", color: "#2563eb"},
  {id: "s2", name: "Web Development", code: "IT 201", color: "#7c3aed"}
];
const seedItems = [
  {id: "i1", subjectId: "s1", category: "Module", title: "Module 1 – Introduction to Business Finance", description: "Read the module and review the examples.", deadline: "2026-09-10", priority: "High", status: "Pending", files: []},
  {id: "i2", subjectId: "s1", category: "Activity", title: "Activity 1 – Financial Decisions", description: "Answer the guide questions.", deadline: "2026-09-12", priority: "Medium", status: "Pending", files: []},
  {id: "i3", subjectId: "s2", category: "Task", title: "HTML/CSS Practice", description: "Create the required webpage.", deadline: "2026-09-18", priority: "High", status: "Pending", files: []}
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("studyflow-auth") === "true");
  const [subjects, setSubjects] = useState(() => load("subjects", seedSubjects));
  const [items, setItems] = useState(() => load("items", seedItems));
  const [selected, setSelected] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => localStorage.setItem("subjects", JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem("items", JSON.stringify(items)), [items]);

  const allItems = items.map(item => ({...item, subject: subjects.find(subject => subject.id === item.subjectId)?.name || "Unknown"}));
  const stats = {
    subjects: subjects.length,
    total: items.length,
    pending: items.filter(item => item.status === "Pending").length,
    submitted: items.filter(item => item.status === "Submitted").length,
    overdue: items.filter(item => item.status === "Pending" && daysLeft(item.deadline) < 0).length
  };
  const filtered = allItems.filter(item =>
    (selected === "dashboard" || item.subjectId === selected) &&
    (item.title + " " + item.description + " " + item.category + " " + item.subject).toLowerCase().includes(query.toLowerCase())
  );
  const submit = id => setItems(items.map(item => item.id === id ? {...item, status: "Submitted", submittedAt: new Date().toISOString()} : item));
  const remove = id => { if (confirm("Delete this requirement?")) setItems(items.filter(item => item.id !== id)); };

  if (!authenticated) return <Login onLogin={() => { localStorage.setItem("studyflow-auth", "true"); setAuthenticated(true); }}/>;

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon"><BookOpen size={22}/></div><div><b>StudyFlow</b><span>Academic Manager</span></div></div>
      <button className={`nav ${selected === "dashboard" ? "active" : ""}`} onClick={() => setSelected("dashboard")}><LayoutDashboard size={18}/>Dashboard</button>
      <div className="sideTitle">SUBJECTS</div>
      {subjects.map(subject => <button key={subject.id} className={`nav ${selected === subject.id ? "active" : ""}`} onClick={() => setSelected(subject.id)}><span className="dot" style={{background: subject.color}}/>{subject.name}</button>)}
      <button className="addSubject" onClick={() => setModal({type: "subject"})}><Plus size={17}/> Add Subject</button>
      <div className="sidebarBottom"><div className="tip"><Clock3 size={17}/><div><b>Stay ahead</b><p>Complete tasks before they turn red.</p></div></div><button className="logout" onClick={() => { localStorage.removeItem("studyflow-auth"); setAuthenticated(false); }}><LogOut size={16}/>Log out</button></div>
    </aside>
    <main>
      <header><div><h1>{selected === "dashboard" ? "Dashboard" : subjects.find(subject => subject.id === selected)?.name}</h1><p>{selected === "dashboard" ? "Keep track of every module, task and activity in one place." : "Manage your requirements and deadlines for this subject."}</p></div><button className="primary" onClick={() => setModal({type: "item", subjectId: selected === "dashboard" ? subjects[0]?.id : selected})}><Plus size={18}/> Add Requirement</button></header>
      {selected === "dashboard" && <>
        <section className="stats">
          <Stat icon={<BookOpen/>} label="Subjects" value={stats.subjects}/><Stat icon={<FileText/>} label="Requirements" value={stats.total}/><Stat icon={<Clock3/>} label="Pending" value={stats.pending}/><Stat icon={<CheckCircle2/>} label="Submitted" value={stats.submitted}/><Stat icon={<CircleAlert/>} label="Overdue" value={stats.overdue}/>
        </section>
        <section className="dashboardGrid">
          <div className="panel"><div className="panelHead"><div><h2>Upcoming deadlines</h2><span>Your next requirements</span></div><CalendarDays size={20}/></div><div className="list">{[...allItems].filter(item => item.status === "Pending").sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 6).map(item => <ItemRow key={item.id} x={item} onSubmit={submit} onDelete={remove} onEdit={() => setModal({type: "item", item})}/>)}</div>{allItems.filter(item => item.status === "Pending").length === 0 && <Empty text="Everything is submitted. Great work!"/>}</div>
          <div className="panel"><div className="panelHead"><div><h2>Subjects</h2><span>Quick overview</span></div></div>{subjects.map(subject => <SubjectCard key={subject.id} subject={subject} items={items} onSelect={setSelected}/>)}</div>
        </section>
      </>}
      {selected !== "dashboard" && <SubjectView items={filtered} onSubmit={submit} onDelete={remove} onEdit={item => setModal({type: "item", item})}/>} 
      {selected === "dashboard" && <section className="panel all"><div className="panelHead"><div><h2>All requirements</h2><span>Search and manage everything</span></div><div className="search"><Search size={17}/><input placeholder="Search..." value={query} onChange={event => setQuery(event.target.value)}/></div></div><div className="table">{filtered.map(item => <ItemRow key={item.id} x={item} showSubject onSubmit={submit} onDelete={remove} onEdit={() => setModal({type: "item", item})}/>)}</div></section>}
    </main>
    {modal && <Modal data={modal} subjects={subjects} setSubjects={setSubjects} setItems={setItems} close={() => setModal(null)}/>} 
  </div>;
}

function Login({onLogin}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const submit = event => {
    event.preventDefault();
    if (username === import.meta.env.VITE_APP_USERNAME && password === import.meta.env.VITE_APP_PASSWORD) onLogin();
    else setError("That username or password is not correct.");
  };
  return <div className="loginPage"><div className="loginArtwork"><div className="artTop"><span className="artMark"><BookOpen size={20}/></span><span>StudyFlow</span></div><div className="artCopy"><p className="eyebrow">ACADEMIC ACTIVITY MANAGER</p><h1>Make every deadline feel manageable.</h1><p>One calm place for your subjects, activities, and progress.</p></div><div className="artNote"><CheckCircle2 size={18}/><span>Keep your momentum visible.</span></div></div><main className="loginMain"><div className="loginCard"><div className="loginIcon"><LockKeyhole size={21}/></div><p className="eyebrow">WELCOME BACK</p><h2>Sign in to StudyFlow</h2><p className="loginIntro">Pick up where you left off.</p><form onSubmit={submit}><label>Username<input autoComplete="username" value={username} onChange={event => { setUsername(event.target.value); setError(""); }} placeholder="Enter your username" autoFocus/></label><label>Password<div className="passwordField"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => { setPassword(event.target.value); setError(""); }} placeholder="Enter your password"/><button type="button" className="passwordToggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>{error && <p className="loginError" role="alert">{error}</p>}<button className="loginSubmit" type="submit">Sign in <ArrowRight size={18}/></button></form><p className="loginFoot">Your workspace is ready when you are.</p></div></main></div>;
}

function Stat({icon, label, value}) { return <div className="stat"><span>{icon}</span><div><b>{value}</b><small>{label}</small></div></div>; }
function SubjectCard({subject, items, onSelect}) { const count = items.filter(item => item.subjectId === subject.id).length; const submitted = items.filter(item => item.subjectId === subject.id && item.status === "Submitted").length; return <div className="subjectCard" onClick={() => onSelect(subject.id)}><span className="subjectIcon" style={{background: subject.color}}><BookOpen size={19}/></span><div className="grow"><b>{subject.name}</b><small>{subject.code || "No code"} · {count} requirements</small><div className="bar"><i style={{width: count ? `${submitted / count * 100}%` : "0%", background: subject.color}}/></div></div><span className="percent">{count ? Math.round(submitted / count * 100) : 0}%</span><ChevronRight size={17}/></div>; }
function SubjectView({items, onSubmit, onDelete, onEdit}) { const [filter, setFilter] = useState("All"); const shown = items.filter(item => filter === "All" || item.category === filter || item.status === filter).sort((a, b) => a.deadline.localeCompare(b.deadline)); return <section className="panel subjectPanel"><div className="filters">{["All", "Module", "Task", "Activity", "Others", "Pending", "Submitted"].map(value => <button className={filter === value ? "sel" : ""} onClick={() => setFilter(value)} key={value}>{value}</button>)}</div><div className="list">{shown.map(item => <ItemRow key={item.id} x={item} onSubmit={onSubmit} onDelete={onDelete} onEdit={() => onEdit(item)}/>)}</div>{!shown.length && <Empty text="No requirements found."/>}</section>; }
function ItemRow({x, onSubmit, onDelete, onEdit, showSubject}) { const remaining = daysLeft(x.deadline); const tone = x.status === "Submitted" ? "submitted" : remaining < 0 ? "overdue" : remaining <= 1 ? "red" : remaining <= 3 ? "orange" : remaining <= 7 ? "yellow" : "green"; return <div className="item"><div className={`deadline ${tone}`}><b>{x.status === "Submitted" ? "✓" : remaining < 0 ? "!" : Math.max(remaining, 0)}</b><small>{x.status === "Submitted" ? "DONE" : remaining < 0 ? "LATE" : remaining === 0 ? "TODAY" : remaining === 1 ? "DAY" : "DAYS"}</small></div><div className="itemMain"><div className="itemTop"><span className="tag">{x.category}</span>{showSubject && <span className="subjectName">{x.subject}</span>}<span className={`priority ${x.priority.toLowerCase()}`}>{x.priority}</span></div><h3>{x.title}</h3><p>{x.description || "No description."}</p><div className="meta">Deadline: <b>{formatDate(x.deadline)}</b>{x.status === "Submitted" && <> · Submitted {formatDateTime(x.submittedAt)}</>}{x.files?.length > 0 && <> · 📎 {x.files.length} file(s)</>}</div></div><div className="actions">{x.status === "Pending" && <button className="done" onClick={() => onSubmit(x.id)}><CheckCircle2 size={16}/> Submitted</button>}<button className="iconBtn" onClick={onEdit}><Pencil size={16}/></button><button className="iconBtn danger" onClick={() => onDelete(x.id)}><Trash2 size={16}/></button></div></div>; }
function Empty({text}) { return <div className="empty"><FolderOpen size={30}/><b>{text}</b></div>; }
function Modal({data, subjects, setSubjects, setItems, close}) { const isSubject = data.type === "subject"; const old = data.item; const [form, setForm] = useState(old ? {...old, files: old.files || []} : isSubject ? {name: "", code: "", color: "#2563eb"} : {subjectId: data.subjectId || subjects[0]?.id, category: "Task", title: "", description: "", deadline: "", priority: "Medium", status: "Pending", files: []}); const save = () => { if (isSubject) { if (!form.name.trim()) return; setSubjects(subjects.some(subject => subject.id === form.id) ? subjects.map(subject => subject.id === form.id ? form : subject) : [...subjects, {...form, id: `s${Date.now()}`}]); } else { if (!form.title.trim() || !form.deadline) return; setItems(old ? items => items.map(item => item.id === old.id ? form : item) : items => [...items, {...form, id: `i${Date.now()}`}]); } close(); }; const fileChange = event => { const files = [...event.target.files].map(file => ({name: file.name, size: file.size, type: file.type})); setForm({...form, files: [...(form.files || []), ...files]}); }; return <div className="overlay"><div className="modal"><div className="modalHead"><h2>{isSubject ? "Add Subject" : old ? "Edit Requirement" : "Add Requirement"}</h2><button onClick={close}><X/></button></div>{isSubject ? <><label>Subject name<input value={form.name} onChange={event => setForm({...form, name: event.target.value})}/></label><label>Subject code<input value={form.code} onChange={event => setForm({...form, code: event.target.value})}/></label><label>Color<input type="color" value={form.color} onChange={event => setForm({...form, color: event.target.value})}/></label></> : <><label>Subject<select value={form.subjectId} onChange={event => setForm({...form, subjectId: event.target.value})}>{subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label>Category<select value={form.category} onChange={event => setForm({...form, category: event.target.value})}>{["Module", "Task", "Activity", "Others"].map(category => <option key={category}>{category}</option>)}</select></label><label>Title<input value={form.title} onChange={event => setForm({...form, title: event.target.value})}/></label><label>Description<textarea value={form.description} onChange={event => setForm({...form, description: event.target.value})}/></label><div className="two"><label>Deadline<input type="date" value={form.deadline} onChange={event => setForm({...form, deadline: event.target.value})}/></label><label>Priority<select value={form.priority} onChange={event => setForm({...form, priority: event.target.value})}>{["Low", "Medium", "High"].map(priority => <option key={priority}>{priority}</option>)}</select></label></div><label className="upload"><Upload size={18}/> Attach files<input type="file" multiple onChange={fileChange}/></label>{form.files?.length > 0 && <div className="fileList">{form.files.map((file, index) => <span key={index}>📎 {file.name}</span>)}</div>}</>}<div className="modalActions"><button onClick={close}>Cancel</button><button className="primary" onClick={save}>Save</button></div></div></div>; }
function daysLeft(date) { if (!date) return 999; const today = new Date(); today.setHours(0, 0, 0, 0); return Math.ceil((new Date(`${date}T00:00:00`) - today) / 86400000); }
function formatDate(date) { if (!date) return "—"; return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"}); }
function formatDateTime(date) { return date ? new Date(date).toLocaleDateString(undefined, {month: "short", day: "numeric"}) : ""; }

createRoot(document.getElementById("root")).render(<App/>);
