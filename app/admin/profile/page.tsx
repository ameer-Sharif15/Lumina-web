"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Edit3,
  Lock,
  Globe
} from "lucide-react";

export default function ProfilePage() {
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse admin user");
      }
    }
  }, []);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-display-sm font-bold text-on-surface mb-1">Account Profile</h1>
        <p className="text-body-sm text-outline">Manage your administrative credentials and personal details.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card ambient-shadow p-8 rounded-2xl flex flex-col items-center text-center border border-outline-variant/50">
            <div className="relative group mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-secondary-container flex items-center justify-center font-bold text-primary text-3xl">
                {adminUser?.personal?.profilePhoto ? (
                  <img src={adminUser.personal.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  adminUser?.fullName?.charAt(0) || "A"
                )}
              </div>
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-title-sm font-bold text-on-surface">{adminUser?.fullName || "Admin User"}</h3>
            <p className="text-[12px] text-outline mb-4">System Administrator</p>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              Full Permissions
            </div>
          </div>

          <div className="glass-card ambient-shadow p-6 rounded-2xl border border-outline-variant/50 space-y-4">
            <h4 className="text-[12px] font-bold text-outline uppercase tracking-wider">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Mail className="w-4 h-4 text-outline" />
                <span className="text-[13px]">{adminUser?.email || "admin@lumina.ai"}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Globe className="w-4 h-4 text-outline" />
                <span className="text-[13px]">Lumina Head Office, Lagos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card ambient-shadow p-8 rounded-2xl border border-outline-variant/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-body-base font-bold text-on-surface flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Details
              </h3>
              <button className="flex items-center gap-2 text-primary font-bold text-[12px] hover:underline">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-outline uppercase">Full Name</label>
                <div className="h-11 px-4 bg-[#F8F9FF] border border-outline-variant rounded-lg flex items-center text-[13px] text-on-surface font-medium">
                  {adminUser?.fullName || "Admin User"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-outline uppercase">Email Address</label>
                <div className="h-11 px-4 bg-[#F8F9FF] border border-outline-variant rounded-lg flex items-center text-[13px] text-on-surface font-medium">
                  {adminUser?.email || "admin@lumina.ai"}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-outline uppercase">Administrative Bio</label>
                <div className="p-4 bg-[#F8F9FF] border border-outline-variant rounded-lg text-[13px] text-on-surface leading-relaxed min-h-[100px]">
                  {adminUser?.personal?.bio || "Chief technology officer and lead administrator for the Lumina AI teacher assistant platform. Responsible for system stability and teacher onboarding."}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card ambient-shadow p-8 rounded-2xl border border-outline-variant/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-body-base font-bold text-on-surface flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Security Settings
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F8F9FF] border border-outline-variant/50 rounded-xl">
                <div>
                  <p className="text-[13px] font-bold text-on-surface">Change Password</p>
                  <p className="text-[11px] text-outline">Last changed 45 days ago</p>
                </div>
                <button className="px-4 py-2 bg-white border border-outline-variant text-[12px] font-bold text-on-surface hover:bg-surface-container transition-all rounded-lg">
                  Update
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F8F9FF] border border-outline-variant/50 rounded-xl">
                <div>
                  <p className="text-[13px] font-bold text-on-surface">Sessions & Activity</p>
                  <p className="text-[11px] text-outline">Current: Windows, Lagos (active now)</p>
                </div>
                <button className="px-4 py-2 bg-white border border-outline-variant text-[12px] font-bold text-on-surface hover:bg-surface-container transition-all rounded-lg">
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
