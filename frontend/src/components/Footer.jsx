import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                SE
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Stay<span className="text-blue-400">Ease</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Infrastructure Automation for Hotel Booking System — A cloud-native travel reservation platform built with modern React, Python Flask, MySQL, and automated AWS cloud infrastructure.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-blue-400 font-mono">
                Terraform IaC
              </span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-emerald-400 font-mono">
                Ansible Automation
              </span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-cyan-400 font-mono">
                Docker Containers
              </span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-amber-400 font-mono">
                Prometheus & Grafana
              </span>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Operations</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>AWS ALB: <strong>Active (Round-Robin)</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Auto Scaling: <strong>2 - 6 Compute Nodes</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>MySQL DB: <strong>Multi-AZ High Availability</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Health Endpoint: <a href="/health" target="_blank" className="text-blue-400 hover:underline font-mono">/health</a></span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/hotels" className="hover:text-white transition">Browse All Hotels</a></li>
              <li><a href="/my-bookings" className="hover:text-white transition">My Reservations</a></li>
              <li><a href="/admin" className="hover:text-white transition">System Administration</a></li>
              <li><a href="/metrics" target="_blank" className="hover:text-white transition font-mono">Prometheus Metrics</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 StayEase Hotel Booking System. Final Year Engineering Project.</p>
          <p>Designed for High Availability, Containerization, and Resilience.</p>
        </div>
      </div>
    </footer>
  );
};
