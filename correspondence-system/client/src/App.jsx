import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Briefcase, Mail, Settings, FileText, Building2, 
  Network, Globe, ArrowLeft, Plus, Trash2, 
  Edit2, FileEdit, Printer, FileDigit, CheckCircle2, Database,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type
} from 'lucide-react';
import { api } from './services/api';

// ==================== REUSABLE COMPONENTS ====================

function Badge({ value }) {
  const styles = {
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Initiated: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Correspondence Created': 'bg-amber-50 text-amber-700 border-amber-200',
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Immediate: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    Urgent: 'bg-orange-50 text-orange-700 border-orange-200',
    Normal: 'bg-green-50 text-green-700 border-green-200',
    Restricted: 'bg-red-50 text-red-700 border-red-200',
    Confidential: 'bg-purple-50 text-purple-700 border-purple-200',
    Public: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
  const matchedStyle = styles[value] || 'bg-slate-100 text-slate-700 border-slate-200';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${matchedStyle}`}>{value}</span>;
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input type="text" value={value || ''} readOnly className="block w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-lg py-2 px-3 focus:outline-none cursor-not-allowed font-medium" />
    </div>
  );
}

// ==================== LAYOUT ====================

function Layout({ children }) {
  const location = useLocation();
  const menuItems = [
    { name: 'Cases', path: '/cases', icon: Briefcase, section: 'Main' },
    { name: 'Correspondence', path: '/correspondence', icon: Mail, section: 'Main' },
    { name: 'Templates', path: '/setup/templates', icon: FileText, section: 'Setup' },
    { name: 'Reference Data', path: '/setup/reference-data', icon: Database, section: 'Setup' },
    { name: 'Translation Dictionary', path: '/setup/translation-dictionary', icon: Globe, section: 'Setup' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <aside className="w-80 bg-[#0f1f38] text-slate-300 flex flex-col border-r border-[#1a2e4c] select-none">
        <div className="p-7 border-b border-[#1a2e4c]">
          <h1 className="font-bold text-xl text-white tracking-tight">Case Letter</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          <div className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Management</h3>
            <div className="space-y-1">
              {menuItems.filter(i => i.section === 'Main').map(item => (
                <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-[#152c4d] hover:text-white'}`}>
                  <item.icon className="w-4 h-4" /> {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Setup</h3>
            <div className="space-y-1">
              {menuItems.filter(i => i.section === 'Setup').map(item => (
                <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path ? 'bg-[#1b365d] text-white border border-blue-500/20' : 'text-slate-400 hover:bg-[#152c4d] hover:text-white'}`}>
                  <item.icon className="w-4 h-4" /> {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">
            {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

// ==================== PAGES: CASES ====================

function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    api.getCases().then(setCases).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = (id, caseNumber) => {
    if (!confirm(`Delete Case ${caseNumber}?`)) return;
    api.deleteCase(id).then(loadData).catch(err => alert(err.message));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cases</h2>
        <button onClick={() => navigate('/cases/new')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm"><Plus className="w-4 h-4" /> Create Case</button>
      </div>
      {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : cases.length === 0 ? <div className="p-12 text-center text-slate-500 font-medium">No records.</div> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Case Number</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Government Entity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Province & City</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{c.case_number}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.government_entity_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.province}, {c.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge value={c.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => navigate(`/cases/${c.id}`)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg font-semibold text-xs">Open</button>
                    <button onClick={() => handleDelete(c.id, c.case_number)} className="bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 py-1.5 px-2 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateCasePage() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [province, setProvince] = useState('Western');
  const [city, setCity] = useState('');
  const [projectType, setProjectType] = useState('');
  const [workMethod, setWorkMethod] = useState('N/A');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getReferenceData('government-entities').then(setEntities);
    api.getReferenceData('cities').then(setAllCities);
  }, []);

  useEffect(() => {
    const filtered = allCities.filter(c => c.province === province);
    setFilteredCities(filtered);
    setCity('');
  }, [province, allCities]);

  useEffect(() => {
    setWorkMethod(projectType === 'Pipeline' ? '' : 'N/A');
  }, [projectType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !selectedEntity || !province || !city || !projectType || !workMethod) return;
    setSubmitting(true);
    api.createCase({ title, government_entity_id: parseInt(selectedEntity), province, city, project_type: projectType, work_method: workMethod })
      .then(newCase => navigate(`/cases/${newCase.id}`)).catch(err => alert(err.message)).finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate('/cases')} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Case</h2>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-7 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Government Entity</label>
          <select required value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
            <option value="">Select Entity...</option>
            {entities.map(e => <option key={e.id} value={e.id}>{e.english_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Province</label>
            <select required value={province} onChange={(e) => setProvince(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
              <option value="Western">Western</option>
              <option value="Central">Central</option>
              <option value="Eastern">Eastern</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
            <select required value={city} onChange={e => setCity(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
              <option value="">Select City...</option>
              {filteredCities.map(c => <option key={c.id} value={c.english_name}>{c.english_name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Type</label>
            <select required value={projectType} onChange={(e) => setProjectType(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
              <option value="">Select Project Type...</option>
              <option value="Pipeline">Pipeline</option>
              <option value="Culvert">Culvert</option>
              <option value="Temporary Site">Temporary Site</option>
              <option value="Borrow Pit">Borrow Pit</option>
              <option value="Well Drilling">Well Drilling</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Work Method</label>
            <select required value={workMethod} onChange={(e) => setWorkMethod(e.target.value)} disabled={projectType !== 'Pipeline'} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm disabled:bg-slate-50">
              {projectType === 'Pipeline' ? <><option value="">Select Work Method...</option><option value="HDD">HDD</option><option value="Open Cut">Open Cut</option></> : <option value="N/A">N/A</option>}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/cases')} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">{submitting ? 'Saving...' : 'Save Case'}</button>
        </div>
      </form>
    </div>
  );
}

function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getCase(id).then(setCaseItem).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDelete = () => {
    if (!confirm(`Delete Case ${caseItem.case_number}?`)) return;
    api.deleteCase(caseItem.id).then(() => navigate('/cases')).catch(err => alert(err.message));
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading...</div>;
  if (!caseItem) return <div className="p-12 text-center text-red-500 font-bold">Not found</div>;

  const activeCorrespondence = caseItem.correspondence && caseItem.correspondence.length > 0 ? caseItem.correspondence[0] : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cases')} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Case: {caseItem.case_number}</h2>
        </div>
        <button onClick={handleDelete} className="text-slate-400 hover:text-rose-600 p-2 transition-colors"><Trash2 className="w-5 h-5" /></button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7 space-y-7">
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Title</span><span className="text-lg font-semibold text-slate-800">{caseItem.title}</span></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Government Entity</span><span className="font-semibold text-slate-800 block text-base">{caseItem.government_entity_name}</span><span className="text-xs text-slate-500 font-medium block" style={{ direction: 'rtl', textAlign: 'left' }}>{caseItem.government_entity_arabic}</span></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Province</span><span className="font-semibold text-slate-800">{caseItem.province}</span></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">City</span><span className="font-semibold text-slate-800">{caseItem.city}</span></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Project Type</span><span className="font-semibold text-slate-800">{caseItem.project_type || '-'}</span></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Work Method</span><span className="font-semibold text-slate-800">{caseItem.work_method || '-'}</span></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Status</span><div className="mt-0.5"><Badge value={caseItem.status} /></div></div>
          <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Created Date</span><span className="font-medium text-slate-700">{new Date(caseItem.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span></div>
        </div>
        <div className="pt-7 border-t border-slate-100 space-y-5">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Estimated Processing Time</span>
            {caseItem.estimated_processing_days != null ? (
              <><div className="text-lg font-semibold text-slate-800">Approximately {caseItem.estimated_processing_days} days</div><div className="text-xs text-slate-500 mt-1">Based on historical case processing patterns.</div></>
            ) : <div className="text-sm font-medium text-slate-500">Estimated processing time unavailable.</div>}
          </div>
          <div className="flex items-center justify-end">
          {activeCorrespondence ? (
            <button onClick={() => navigate(`/correspondence/${activeCorrespondence.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm transition-all text-xs uppercase tracking-wider"><Mail className="w-4 h-4" /> Open Active Correspondence</button>
          ) : (
            <button onClick={() => navigate(`/cases/${caseItem.id}/start-correspondence`)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm transition-all text-xs uppercase tracking-wider"><Plus className="w-4 h-4" /> Start Correspondence</button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== START CORRESPONDENCE ====================

function StartCorrespondencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [affairs, setAffairs] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Form
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedAddr, setSelectedAddress] = useState('');
  const [selectedAffair, setSelectedAffair] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [priority, setPriority] = useState('Immediate');
  const [confidentiality, setConfidentiality] = useState('Restricted');
  const [sender, setSender] = useState('');
  const [performer, setPerformer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCase(id).then(item => {
      setCaseItem(item);
      setSelectedEntity(item.government_entity_id);
    }).catch(console.error).finally(() => setLoading(false));
    api.getTemplates().then(setTemplates);
  }, [id]);

  // Hierarchical loading
  useEffect(() => {
    if (selectedEntity) {
      api.getReferenceData('department-names').then(list => setDepartments(list.filter(d => d.government_entity_id == selectedEntity)));
    } else setDepartments([]);
    setSelectedDept('');
  }, [selectedEntity]);

  useEffect(() => {
    if (selectedDept) {
      api.getReferenceData('title-addresses').then(list => setAddresses(list.filter(a => a.department_name_id == selectedDept)));
    } else setAddresses([]);
    setSelectedAddress('');
  }, [selectedDept]);

  useEffect(() => {
    if (selectedAddr) {
      api.getReferenceData('government-affairs').then(list => setAffairs(list.filter(a => a.title_address_id == selectedAddr)));
    } else setAffairs([]);
    setSelectedAffair('');
  }, [selectedAddr]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectDescription || !selectedAffair || !selectedTemplate) return;
    setSubmitting(true);
    api.createCorrespondence({
      case_id: parseInt(id), project_description: projectDescription,
      government_affairs_id: parseInt(selectedAffair), title_address_id: parseInt(selectedAddr),
      department_name_id: parseInt(selectedDept), template_id: parseInt(selectedTemplate),
      priority, confidentiality, sender: sender || '-', performer: performer || '-'
    }).then(newCorr => navigate(`/correspondence/${newCorr.id}`)).catch(err => alert(err.message)).finally(() => setSubmitting(false));
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading...</div>;
  if (!caseItem) return <div className="p-12 text-center text-red-500 font-bold">Case not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/cases/${caseItem.id}`)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Start Correspondence</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">
        <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 h-fit">
          <ReadOnlyField label="Title" value={caseItem.title} />
          <ReadOnlyField label="Government Entity" value={caseItem.government_entity_name} />
          <ReadOnlyField label="Province" value={caseItem.province} />
          <ReadOnlyField label="City" value={caseItem.city} />
        </div>
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-7 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Description</label>
            <textarea rows={4} required value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Name</label>
              <select required value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
                <option value="">Select...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.english_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title Address</label>
              <select required value={selectedAddr} onChange={(e) => setSelectedAddress(e.target.value)} disabled={!selectedDept} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm disabled:bg-slate-50">
                <option value="">Select...</option>
                {addresses.map(a => <option key={a.id} value={a.id}>{a.english_value}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Government Affairs</label>
              <select required value={selectedAffair} onChange={(e) => setSelectedAffair(e.target.value)} disabled={!selectedAddr} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm disabled:bg-slate-50">
                <option value="">Select...</option>
                {affairs.map(a => <option key={a.id} value={a.id}>{a.english_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Template</label>
              <select required value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
                <option value="">Select...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
              <select required value={priority} onChange={(e) => setPriority(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
                <option value="Immediate">Immediate</option><option value="Urgent">Urgent</option><option value="Normal">Normal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confidentiality</label>
              <select required value={confidentiality} onChange={(e) => setConfidentiality(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
                <option value="Restricted">Restricted</option><option value="Confidential">Confidential</option><option value="Public">Public</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sender</label><input type="text" value={sender} onChange={e => setSender(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" placeholder="Optional" /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Performer</label><input type="text" value={performer} onChange={e => setPerformer(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" placeholder="Optional" /></div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate(`/cases/${caseItem.id}`)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">{submitting ? 'Creating...' : 'Create Correspondence'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==================== CORRESPONDENCE ====================

function CorrespondenceListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const loadData = () => { setLoading(true); api.getCorrespondences().then(setList).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { loadData(); }, []);
  const handleDelete = (id, num) => { if (!confirm(`Delete Correspondence ${num}?`)) return; api.deleteCorrespondence(id).then(loadData).catch(err => alert(err.message)); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Correspondence</h2>
      {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : list.length === 0 ? <div className="p-12 text-center text-slate-500 font-medium">No records.</div> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Number</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Related Case</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
              {list.map(corr => (
                <tr key={corr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{corr.correspondence_number}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 mr-2 font-mono">{corr.case_number}</span>{corr.case_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge value={corr.priority} /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge value={corr.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-2">
                    <button onClick={() => navigate(`/correspondence/${corr.id}`)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg font-semibold text-xs">Open</button>
                    <button onClick={() => handleDelete(corr.id, corr.correspondence_number)} className="bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 py-1.5 px-2 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CorrespondenceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [corr, setCorr] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getCorrespondence(id).then(setCorr).catch(console.error).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="p-12 text-center text-slate-400">Loading...</div>;
  if (!corr) return <div className="p-12 text-center text-red-500 font-bold">Not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/cases/${corr.case_id}`)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Correspondence: {corr.correspondence_number}</h2>
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-7 space-y-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Parameters</h3><Badge value={corr.status} /></div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Main Case</span><span className="font-semibold text-slate-800 text-base">{corr.case_title}</span></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Template</span><span className="font-semibold text-slate-800">{corr.template_name}</span></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Title Address</span><span className="font-semibold text-slate-800 block">{corr.title_address_name}</span><span className="text-xs text-slate-500 font-medium">{corr.title_address_arabic}</span></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Affairs</span><span className="font-semibold text-slate-800 block">{corr.government_affairs_name}</span></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Entity</span><span className="font-semibold text-slate-800 block">{corr.government_entity_name}</span></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Date</span><span className="font-medium text-slate-700">{new Date(corr.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span></div>
          </div>
          <div className="border-t border-slate-100 pt-5 space-y-2"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Project Description</span><div className="bg-slate-50 rounded-lg p-5 text-sm text-slate-700 leading-relaxed border border-slate-150">{corr.project_description}</div></div>
        </div>
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Authority</h3>
            <div className="space-y-5 text-sm">
              <div className="space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Priority</span><Badge value={corr.priority} /></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Confidentiality</span><Badge value={corr.confidentiality} /></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Sender</span><span className="font-semibold text-slate-800">{corr.sender}</span></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Performer</span><span className="font-semibold text-slate-800">{corr.performer}</span></div>
            </div>
          </div>
          <button onClick={() => navigate(`/correspondence/${corr.id}/draft-letter`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md transition-all uppercase tracking-[0.1em] text-xs"><FileEdit className="w-5 h-5" /> Draft Letter</button>
        </div>
      </div>
    </div>
  );
}

// ==================== DRAFT LETTER ====================

function DraftLetterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState('4');

  useEffect(() => { api.generateDraft(id).then(setDraft).catch(console.error).finally(() => setLoading(false)); }, [id]);
  const execCommand = (command, value = null) => { document.execCommand(command, false, value); if (editorRef.current) editorRef.current.focus(); };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium italic">Generating letter draft from template...</div>;
  if (!draft) return <div className="p-12 text-center text-red-500 font-bold">Error generating draft.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/correspondence/${id}`)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Draft Letter</h2>
        </div>
        <button onClick={() => window.print()} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm text-xs transition-all"><Printer className="w-4 h-4 text-blue-600" /> Print Letter</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-5 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none px-8">
          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> Editing Mode Active</span>
          <span className="h-4 w-px bg-slate-200"></span>
          <div className="flex items-center gap-4 text-slate-700">
            <button onClick={() => execCommand('bold')} className="hover:text-blue-600" title="Bold">B</button>
            <button onClick={() => execCommand('italic')} className="hover:text-blue-600 italic" title="Italic">I</button>
            <button onClick={() => execCommand('underline')} className="hover:text-blue-600 underline" title="Underline">U</button>
          </div>
          <span className="h-4 w-px bg-slate-200"></span>
          <select value={fontSize} onChange={e => { setFontSize(e.target.value); execCommand('fontSize', e.target.value); }} className="bg-transparent border-none text-[10px] font-bold uppercase focus:ring-0 cursor-pointer">
            <option value="3">Small</option><option value="4">Normal</option><option value="5">Large</option><option value="6">Heading</option>
          </select>
          <span className="h-4 w-px bg-slate-200"></span>
          <button onClick={() => execCommand('justifyRight')} title="Align Right"><AlignRight className="w-4 h-4" /></button>
          <button onClick={() => execCommand('justifyCenter')} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
          <button onClick={() => execCommand('justifyLeft')} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
        </div>
        <div className="p-16 bg-slate-200/40 flex justify-center overflow-auto min-h-[600px]">
          <div ref={editorRef} contentEditable="true" className="bg-white w-full max-w-[800px] min-h-[1000px] shadow-2xl p-16 border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow" style={{ direction: 'rtl', fontFamily: "'Amiri', serif" }} dangerouslySetInnerHTML={{ __html: draft.html }} />
        </div>
      </div>
    </div>
  );
}

// ==================== SYSTEM SETUP ====================

function ReferenceDataPage() {
  const [category, setCategory] = useState('government-entities');
  const [items, setItems] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [englishText, setEnglishText] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [parentId, setParentId] = useState('');
  const [editingId, setEditingId] = useState(null);

  const categories = [
    { slug: 'government-entities', name: 'Entities', keyEng: 'english_name', keyAra: 'arabic_name' },
    { slug: 'department-names', name: 'Departments', keyEng: 'english_name', keyAra: 'arabic_name', parentCategory: 'government-entities', parentKey: 'government_entity_id' },
    { slug: 'title-addresses', name: 'Title Addresses', keyEng: 'english_value', keyAra: 'arabic_value', parentCategory: 'department-names', parentKey: 'department_name_id' },
    { slug: 'government-affairs', name: 'Affairs', keyEng: 'english_name', keyAra: 'arabic_name', parentCategory: 'title-addresses', parentKey: 'title_address_id' },
    { slug: 'cities', name: 'Cities', keyEng: 'english_name', keyAra: 'arabic_name', isCity: true }
  ];

  const current = categories.find(c => c.slug === category);

  const loadData = () => {
    setLoading(true);
    api.getReferenceData(category).then(setItems).catch(console.error).finally(() => setLoading(false));
    if (current.parentCategory) {
      api.getReferenceData(current.parentCategory).then(setParents);
    } else { setParents([]); }
  };

  useEffect(() => { loadData(); setEditingId(null); setEnglishText(''); setArabicText(''); setParentId(''); }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { [current.keyEng || 'english_name']: englishText, [current.keyAra || 'arabic_name']: arabicText };
    if (current.isCity) data.province = parentId;
    else if (current.parentCategory) data[current.parentKey] = parentId;

    if (editingId) api.updateReferenceData(category, editingId, data).then(loadData).catch(err => alert(err.message));
    else api.createReferenceData(category, data).then(loadData).catch(err => alert(err.message));
    setEditingId(null); setEnglishText(''); setArabicText(''); setParentId('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reference Data</h2>
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-fit">
        {categories.map(c => <button key={c.slug} onClick={() => setCategory(c.slug)} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${category === c.slug ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{c.name}</button>)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {current.isCity ? (
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Province</label><select required value={parentId} onChange={e => setParentId(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm"><option value="">Select...</option><option value="Western">Western</option><option value="Central">Central</option><option value="Eastern">Eastern</option></select></div>
            ) : current.parentCategory && (
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Parent {current.parentCategory.replace(/-/g, ' ')}</label><select required value={parentId} onChange={e => setParentId(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm"><option value="">Select...</option>{parents.map(p => <option key={p.id} value={p.id}>{p.english_name || p.english_value}</option>)}</select></div>
            )}
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">English</label><input type="text" required value={englishText} onChange={e => setEnglishText(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm" /></div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Arabic</label><input type="text" required value={arabicText} onChange={e => setArabicText(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-right" style={{ direction: 'rtl' }} /></div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider">{editingId ? 'Update' : 'Save'}</button>
          </form>
        </div>
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr>{(current.isCity || current.parentCategory) && <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Parent</th>}<th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">English</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Arabic</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {(current.isCity || current.parentCategory) && <td className="px-6 py-4 text-[10px] font-bold uppercase text-slate-500">{item.province || item.parent_name}</td>}
                  <td className="px-6 py-4 font-medium">{item[current.keyEng || 'english_name']}</td>
                  <td className="px-6 py-4 text-right font-bold" style={{ direction: 'rtl' }}>{item[current.keyAra || 'arabic_name']}</td>
                  <td className="px-6 py-4 text-right space-x-3"><button onClick={() => { setEditingId(item.id); setEnglishText(item[current.keyEng || 'english_name']); setArabicText(item[current.keyAra || 'arabic_name']); setParentId(item.province || item[current.parentKey]); }} className="text-blue-600 font-bold text-xs">Edit</button><button onClick={() => { if (confirm('Delete?')) api.deleteReferenceData(category, item.id).then(loadData); }} className="text-rose-500 font-bold text-xs">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TranslationDictionaryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eng, setEng] = useState('');
  const [ara, setAra] = useState('');
  const [editId, setEditId] = useState(null);
  const load = () => { setLoading(true); api.getDictionary().then(setItems).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const save = (e) => { e.preventDefault(); if (editId) api.updateDictionaryEntry(editId, { english_value: eng, arabic_value: ara }).then(load); else api.createDictionaryEntry({ english_value: eng, arabic_value: ara }).then(load); setEng(''); setAra(''); setEditId(null); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dictionary</h2>
      <div className="grid grid-cols-3 gap-8">
        <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit space-y-5">
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">English</label><input type="text" required value={eng} onChange={e => setEng(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm" /></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Arabic</label><input type="text" required value={ara} onChange={e => setAra(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-right" style={{ direction: 'rtl' }} /></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider">{editId ? 'Update' : 'Add'}</button>
        </form>
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">English</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Arabic</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{item.english_value}</td>
                  <td className="px-6 py-4 text-right font-bold" style={{ direction: 'rtl' }}>{item.arabic_value}</td>
                  <td className="px-6 py-4 text-right space-x-3"><button onClick={() => { setEditId(item.id); setEng(item.english_value); setAra(item.arabic_value); }} className="text-blue-600 font-bold text-xs">Edit</button><button onClick={() => { if (confirm('Delete?')) api.deleteDictionaryEntry(item.id).then(load); }} className="text-rose-500 font-bold text-xs">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TemplatesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const load = () => { setLoading(true); api.getTemplates().then(setList).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = (e) => {
    e.preventDefault(); if (!name || !file) return; setSubmitting(true);
    const fd = new FormData(); fd.append('name', name); fd.append('templateFile', file);
    api.uploadTemplate(fd).then(() => { setName(''); setFile(null); document.getElementById('f').value = ''; load(); }).catch(err => alert(err.message)).finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Templates</h2>
      <div className="grid grid-cols-3 gap-8">
        <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit space-y-5">
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Template Name</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm" /></div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">DOCX File</label><input id="f" type="file" accept=".docx" onChange={e => setFile(e.target.files[0])} className="block w-full text-xs border border-slate-200 rounded-lg py-1.5 px-2" /></div>
          <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider">{submitting ? 'Uploading...' : 'Save Template'}</button>
        </form>
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Name</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">File</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Placeholders</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {list.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{t.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[10px] truncate max-w-[120px]">{t.file_path.split(/[\\/]/).pop()}</td>
                  <td className="px-6 py-4 flex flex-wrap gap-1">{(JSON.parse(t.placeholders_json || '[]')).map(p => <span key={p} className="bg-blue-50 text-blue-600 text-[9px] px-1.5 rounded border border-blue-100">{p}</span>)}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => { if (confirm('Delete?')) api.deleteTemplate(t.id).then(load); }} className="text-rose-500 font-bold text-xs">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== APP ====================

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CasesPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/new" element={<CreateCasePage />} />
        <Route path="/cases/:id" element={<CaseDetailsPage />} />
        <Route path="/cases/:id/start-correspondence" element={<StartCorrespondencePage />} />
        <Route path="/correspondence" element={<CorrespondenceListPage />} />
        <Route path="/correspondence/:id" element={<CorrespondenceDetailsPage />} />
        <Route path="/correspondence/:id/draft-letter" element={<DraftLetterPage />} />
        <Route path="/setup/templates" element={<TemplatesPage />} />
        <Route path="/setup/reference-data" element={<ReferenceDataPage />} />
        <Route path="/setup/translation-dictionary" element={<TranslationDictionaryPage />} />
      </Routes>
    </Layout>
  );
}
