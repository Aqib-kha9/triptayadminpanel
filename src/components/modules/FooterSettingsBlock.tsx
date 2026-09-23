import React from "react";
import { useAdmin } from "../../context/AdminContext";
import { LayoutTemplate, Plus, X } from "lucide-react";

export const FooterSettingsBlock: React.FC = () => {
  const { footerSettings, setFooterSettings } = useAdmin();

  // Helper to ensure settings exist
  const getSettings = () => {
    return footerSettings || {
      companyDesc: "",
      contact: { email: "", phone: "" },
      links: { company: [], support: [], legal: [] },
      social: { instagram: "", facebook: "", twitter: "", youtube: "" }
    };
  };

  const settings = getSettings();

  const updateSettings = (newSettings: any) => {
    setFooterSettings(newSettings);
  };

  const handleLinkChange = (category: "company" | "support" | "legal", index: number, field: "label" | "href", value: string) => {
    const newSettings = { ...settings };
    if (!newSettings.links) newSettings.links = { company: [], support: [], legal: [] };
    if (!newSettings.links[category]) newSettings.links[category] = [];
    newSettings.links[category][index][field] = value;
    updateSettings(newSettings);
  };

  const addLink = (category: "company" | "support" | "legal") => {
    const newSettings = { ...settings };
    if (!newSettings.links) newSettings.links = { company: [], support: [], legal: [] };
    if (!newSettings.links[category]) newSettings.links[category] = [];
    newSettings.links[category].push({ label: "", href: "" });
    updateSettings(newSettings);
  };

  const removeLink = (category: "company" | "support" | "legal", index: number) => {
    const newSettings = { ...settings };
    if (!newSettings.links) newSettings.links = { company: [], support: [], legal: [] };
    if (!newSettings.links[category]) newSettings.links[category] = [];
    newSettings.links[category].splice(index, 1);
    updateSettings(newSettings);
  };

  return (
    <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-8 space-y-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
          <LayoutTemplate className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Public Footer Layout</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">Manage global footer description, links, and contact details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Company Description</label>
            <textarea
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
              value={settings.companyDesc || ""}
              onChange={(e) => updateSettings({ ...settings, companyDesc: e.target.value })}
              placeholder="Curating India's most unique homestays..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Contact Email</label>
              <input
                type="email"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={settings.contact?.email || ""}
                onChange={(e) => updateSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Contact Phone</label>
              <input
                type="text"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={settings.contact?.phone || ""}
                onChange={(e) => updateSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {(["company", "support", "legal"] as const).map((category) => (
            <div key={category} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest capitalize">{category} Links</h4>
                <button 
                  onClick={() => addLink(category)}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {settings.links?.[category]?.map((link: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="w-1/2 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => handleLinkChange(category, idx, "label", e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-1/2 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50"
                      placeholder="URL (/about)"
                      value={link.href}
                      onChange={(e) => handleLinkChange(category, idx, "href", e.target.value)}
                    />
                    <button 
                      onClick={() => removeLink(category, idx)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 bg-white rounded-lg border border-zinc-200 hover:border-rose-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!settings.links?.[category] || settings.links[category].length === 0) && (
                  <p className="text-[10px] text-zinc-400 font-medium italic">No links added</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
