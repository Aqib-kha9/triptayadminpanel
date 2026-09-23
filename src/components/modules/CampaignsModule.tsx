import React, { useState } from "react";
import { 
  Send, 
  Trash2, 
  Play, 
  AlertCircle, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Bell, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText,
  Plus,
  Edit3,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const CampaignsModule: React.FC = () => {
  const {
    campaigns,
    newCampTitle,
    setNewCampTitle,
    newCampGroup,
    setNewCampGroup,
    newCampChannel,
    setNewCampChannel,
    newCampSubject,
    setNewCampSubject,
    newCampContent,
    setNewCampContent,
    newCampScheduled,
    setNewCampScheduled,
    newCampScheduledAt,
    setNewCampScheduledAt,
    handleLaunchCampaign,
    handleExecuteCampaign,
    handleCancelCampaign,
    handleDeleteCampaign,
    refreshCampaigns,
    
    // Templates State & Handlers
    templates,
    templatesLoading,
    refreshTemplates,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate
  } = useAdmin();

  // Active Tab: "blaster" | "templates"
  const [activeTab, setActiveTab] = useState<"blaster" | "templates">("blaster");

  // Template Form State (For Creation & Editing)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempType, setTempType] = useState<"email" | "whatsapp" | "push">("email");
  const [tempSubject, setTempSubject] = useState("");
  const [tempBody, setTempBody] = useState("");

  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  // Handle Preset Load
  const handleLoadPreset = (templateId: string) => {
    const selected = templates.find(t => t.id === templateId);
    if (!selected) return;
    
    setNewCampTitle(selected.name);
    setNewCampContent(selected.body);
    
    if (selected.type === "email") {
      setNewCampChannel("AWS SES Email");
      setNewCampSubject(selected.subject || "");
    } else if (selected.type === "whatsapp") {
      setNewCampChannel("Twilio WhatsApp");
      setNewCampSubject("");
    } else {
      setNewCampChannel("Firebase Push");
      setNewCampSubject("");
    }
  };

  // Submit Template (Create or Update)
  const handleTemplateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName || !tempBody) return;
    
    try {
      if (isEditingTemplate && editingTemplateId) {
        await handleUpdateTemplate(editingTemplateId, {
          name: tempName,
          type: tempType,
          subject: tempType === "email" ? tempSubject : undefined,
          body: tempBody
        });
      } else {
        await handleCreateTemplate({
          name: tempName,
          type: tempType,
          subject: tempType === "email" ? tempSubject : undefined,
          body: tempBody
        });
      }
      // Reset Form
      setTempName("");
      setTempSubject("");
      setTempBody("");
      setIsEditingTemplate(false);
      setEditingTemplateId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Populate form for editing
  const startEditTemplate = (t: any) => {
    setIsEditingTemplate(true);
    setEditingTemplateId(t.id);
    setTempName(t.name);
    setTempType(t.type);
    setTempSubject(t.subject || "");
    setTempBody(t.body);
    setActiveTab("templates");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Tab Switchers */}
      <div className="flex border-b border-zinc-100 gap-6">
        <button
          onClick={() => setActiveTab("blaster")}
          className={cn(
            "pb-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "blaster" ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Send className="w-4 h-4" /> Campaign Dispatcher
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "pb-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "templates" ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-400 hover:text-zinc-600"
          )}
        >
          <FileText className="w-4 h-4" /> Message Templates Library
        </button>
      </div>

      {activeTab === "blaster" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Campaign Form */}
          <div className="space-y-8 xl:col-span-1">
            <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 tracking-tight">Campaign Composer</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Compile bulk dispatch broadcasts</p>
                  </div>
                </div>
              </div>

              {/* Template Preset Loader */}
              {templates.length > 0 && (
                <div className="space-y-1 bg-zinc-50/70 border border-zinc-100 p-4 rounded-2xl">
                  <label className="text-[9px] font-black tracking-normal text-zinc-400 uppercase flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-zinc-500" /> Auto-Load Saved Template Preset
                  </label>
                  <select 
                    onChange={e => {
                      if (e.target.value) handleLoadPreset(e.target.value);
                      e.target.value = ""; // Reset value after loading
                    }}
                    className="w-full border border-zinc-200 bg-white rounded-xl px-3 py-2 text-xs font-bold outline-none text-zinc-700"
                  >
                    <option value="">-- Choose a Preset to Autofill Composer --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={handleLaunchCampaign} className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Campaign Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Monsoon Rafting Special Offer"
                    value={newCampTitle}
                    onChange={e => setNewCampTitle(e.target.value)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                    required
                  />
                </div>

                {/* Target Group */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Target Audience</label>
                  <select 
                    value={newCampGroup}
                    onChange={e => setNewCampGroup(e.target.value as any)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                  >
                    <option value="Guests">Traveler Guests Segment</option>
                    <option value="Vendors">Vendor Host Segment</option>
                    <option value="All Users">All Registered Users</option>
                  </select>
                </div>

                {/* Channel Dispatcher */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Gateway Channel</label>
                  <select 
                    value={newCampChannel}
                    onChange={e => setNewCampChannel(e.target.value as any)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                  >
                    <option value="AWS SES Email">AWS SES Email System</option>
                    <option value="Twilio WhatsApp">Meta WhatsApp Cloud API (Native)</option>
                    <option value="Firebase Push">Firebase Push Alerts (FCM)</option>
                  </select>
                </div>

                {/* Conditional Email Subject */}
                {newCampChannel === "AWS SES Email" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Email Subject</label>
                    <input 
                      type="text"
                      placeholder="e.g. Get 20% off Ganga river rafting this weekend!"
                      value={newCampSubject}
                      onChange={e => setNewCampSubject(e.target.value)}
                      className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                      required={newCampChannel === "AWS SES Email"}
                    />
                  </div>
                )}

                {/* Campaign Body Content */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Message Content</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter campaign template body..."
                    value={newCampContent}
                    onChange={e => setNewCampContent(e.target.value)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                    required
                  />
                  <p className="text-[9px] text-zinc-400 font-medium pt-1">
                    💡 Variables like <span className="font-bold text-zinc-600">{"{{name}}"}</span> are populated at dispatch time.
                  </p>
                </div>

                {/* Scheduler Toggle */}
                <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                  <div>
                    <span className="text-xs font-black text-zinc-800">Schedule for Later</span>
                    <p className="text-[9px] text-zinc-400 font-bold">Defer execution to a future timezone slot</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewCampScheduled(!newCampScheduled)}
                    className={`w-10 h-5 rounded-full transition-all relative flex items-center ${newCampScheduled ? "bg-teal-500" : "bg-zinc-200"}`}
                  >
                    <span className={`h-3 w-3 rounded-full bg-white shadow absolute transition-all ${newCampScheduled ? "right-1" : "left-1"}`} />
                  </button>
                </div>

                {/* Datetime Picker for Scheduled At */}
                {newCampScheduled && (
                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Select Release Time
                    </label>
                    <input 
                      type="datetime-local"
                      value={newCampScheduledAt}
                      onChange={e => setNewCampScheduledAt(e.target.value)}
                      className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                      required={newCampScheduled}
                    />
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> {newCampScheduled ? "Schedule Campaign" : "Blast Campaign Now"}
                </button>
              </form>
            </div>
          </div>

          {/* Directory lists */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-50">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" /> Campaign Dispatch Directory
                  </h3>
                  <p className="text-xs text-zinc-400 font-semibold">Track queue logs, deliverability rates, and scheduler parameters</p>
                </div>
                <button
                  type="button"
                  onClick={refreshCampaigns}
                  className="px-4 py-2 border border-zinc-100 hover:bg-zinc-50 rounded-2xl text-[10px] font-black tracking-tight text-zinc-700 flex items-center gap-1 transition-all"
                >
                  Refresh Directory
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-50 text-[10px] font-black tracking-tight text-zinc-400 uppercase">
                      <th className="py-4 px-4">Campaign Title</th>
                      <th className="py-4 px-4">Channel</th>
                      <th className="py-4 px-4">Segment</th>
                      <th className="py-4 px-4">Scheduler Date</th>
                      <th className="py-4 px-4">Delivery Rate</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-xs font-bold text-zinc-700">
                    {campaigns.map(cmp => (
                      <tr key={cmp.id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="text-zinc-950 font-black block">{cmp.title}</span>
                            <span className="text-[9px] text-zinc-400 font-bold block">ID: {cmp.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-600">
                          <div className="flex items-center gap-1.5">
                            {cmp.channel === "AWS SES Email" ? (
                              <Mail className="w-3.5 h-3.5 text-blue-500" />
                            ) : cmp.channel === "Twilio WhatsApp" ? (
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Bell className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span>{cmp.channel === "Twilio WhatsApp" ? "WhatsApp" : cmp.channel.replace("AWS SES ", "").replace("Firebase ", "")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 bg-zinc-50 text-zinc-600 px-2 py-0.5 rounded text-[9px] font-black border border-zinc-100">
                            <Users className="w-3 h-3" /> {cmp.targetGroup}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-zinc-400 text-[10px] font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>{cmp.scheduledTime || "Immediate"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {cmp.status === "Sent" || cmp.status === "Running" ? (
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              {/* Progress bar */}
                              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-500",
                                    cmp.status === "Running" ? "bg-blue-500" : "bg-emerald-500"
                                  )}
                                  style={{ 
                                    width: `${Math.min(100, cmp.analytics.sent > 0 ? (cmp.analytics.sent / Math.max(1, cmp.analytics.sent)) * 105 : 0)}%` 
                                  }}
                                />
                              </div>
                              <div className="flex gap-2 text-[9px] font-black text-zinc-400">
                                <span>SENT: <span className="text-zinc-800">{cmp.analytics.sent}</span></span>
                                <span>OPEN: <span className="text-blue-500">{cmp.analytics.opens}</span></span>
                                <span>FAIL: <span className="text-rose-500">{cmp.analytics.failed || 0}</span></span>
                              </div>
                            </div>
                          ) : (
                            <span className="italic text-zinc-300">Awaiting queue release</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border",
                            cmp.status === "Sent" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                            cmp.status === "Running" && "bg-blue-50 text-blue-600 border-blue-100 animate-pulse",
                            cmp.status === "Scheduled" && "bg-amber-50 text-amber-600 border-amber-100",
                            cmp.status === "Draft" && "bg-zinc-100 text-zinc-400 border-zinc-200"
                          )}>
                            {cmp.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(cmp.status === "Draft" || cmp.status === "Scheduled") && (
                              <button
                                type="button"
                                title="Execute Immediately"
                                onClick={() => handleExecuteCampaign(cmp.id)}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg border border-transparent hover:border-emerald-100 transition-all active:scale-95"
                              >
                                <Play className="w-4 h-4 fill-emerald-600/10" />
                              </button>
                            )}
                            {cmp.status === "Scheduled" && (
                              <button
                                type="button"
                                title="Pause/Cancel Release"
                                onClick={() => handleCancelCampaign(cmp.id)}
                                className="p-1.5 hover:bg-amber-50 text-amber-600 hover:text-amber-700 rounded-lg border border-transparent hover:border-amber-100 transition-all active:scale-95"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete Campaign Record"
                              onClick={() => handleDeleteCampaign(cmp.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-100 transition-all active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {campaigns.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400 italic">
                          No campaign records compiled in database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Template Form */}
          <div className="space-y-8 xl:col-span-1">
            <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 tracking-tight">
                    {isEditingTemplate ? "Modify Template" : "Add New Template"}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Save templates for quick campaigns</p>
                </div>
              </div>

              <form onSubmit={handleTemplateFormSubmit} className="space-y-4">
                {/* Template Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Template Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Winter Holiday Offer"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                    required
                  />
                </div>

                {/* Template Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Type / Channel</label>
                  <select 
                    value={tempType}
                    onChange={e => setTempType(e.target.value as any)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                  >
                    <option value="email">Email Template</option>
                    <option value="whatsapp">WhatsApp Template</option>
                    <option value="push">Firebase Push Notification</option>
                  </select>
                </div>

                {/* Subject - Conditional */}
                {tempType === "email" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Email Subject</label>
                    <input 
                      type="text"
                      placeholder="e.g. Flat 15% discount coupon inside!"
                      value={tempSubject}
                      onChange={e => setTempSubject(e.target.value)}
                      className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                      required={tempType === "email"}
                    />
                  </div>
                )}

                {/* Body */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-normal text-zinc-400 uppercase">Body Content</label>
                  <textarea 
                    rows={6}
                    placeholder="Hey {{name}}, booking with code..."
                    value={tempBody}
                    onChange={e => setTempBody(e.target.value)}
                    className="w-full border border-zinc-100 bg-zinc-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 transition-all text-zinc-700"
                    required
                  />
                  <p className="text-[9px] text-zinc-400 font-medium">
                    💡 Placeholders like <span className="font-bold text-zinc-600">{"{{name}}"}</span> will be automatically replaced with guest names during campaign releases.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {isEditingTemplate ? "Update Template" : "Save Template"}
                  </button>
                  {isEditingTemplate && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditingTemplate(false);
                        setEditingTemplateId(null);
                        setTempName("");
                        setTempSubject("");
                        setTempBody("");
                      }}
                      className="py-3.5 px-4 rounded-2xl border border-zinc-200 text-zinc-600 text-xs font-black tracking-tight hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Templates Library grid */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white border border-zinc-100 shadow-sm rounded-[36px] p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-50">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> Presets & Custom Saved Templates
                  </h3>
                  <p className="text-xs text-zinc-400 font-semibold">Manage, edit, and click template records to autofill composer</p>
                </div>
                <button
                  type="button"
                  onClick={refreshTemplates}
                  className="px-4 py-2 border border-zinc-100 hover:bg-zinc-50 rounded-2xl text-[10px] font-black tracking-tight text-zinc-700 flex items-center gap-1 transition-all"
                >
                  Refresh Templates
                </button>
              </div>

              {templatesLoading ? (
                <div className="py-12 text-center text-zinc-400 italic">
                  Loading templates library database...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(t => (
                    <div 
                      key={t.id} 
                      className="border border-zinc-100 hover:border-zinc-200 rounded-3xl p-5 space-y-4 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-black text-zinc-900 block truncate">{t.name}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shrink-0",
                            t.type === "email" && "bg-blue-50 text-blue-600 border-blue-100",
                            t.type === "whatsapp" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                            t.type === "push" && "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {t.type}
                          </span>
                        </div>
                        {t.subject && (
                          <p className="text-[10px] font-bold text-zinc-500 truncate">
                            Subject: <span className="font-semibold text-zinc-400">{t.subject}</span>
                          </p>
                        )}
                        <p className="text-[11px] font-medium text-zinc-500 line-clamp-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-50 whitespace-pre-line font-mono">
                          {t.body}
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-50 pt-3">
                        <button
                          type="button"
                          onClick={() => handleLoadPreset(t.id)}
                          className="text-[10px] font-black text-teal-600 hover:text-teal-700 transition-all flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-teal-600/10" /> Use Preset
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditTemplate(t)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-500 rounded-lg transition-all"
                            title="Edit Template"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(t.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-all"
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {templates.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-400 italic">
                      No custom templates saved in library.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
