"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/212776668738"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-600 text-white rounded-full shadow-xl px-4 py-3 hover:bg-green-700 transition-colors"
    >
      <MessageCircle size={24} />
      <span className="text-sm font-semibold">0776668738</span>
    </a>
  );
}