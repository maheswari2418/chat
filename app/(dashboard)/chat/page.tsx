export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] text-center p-8 h-full">
      <div className="w-28 h-28 rounded-full bg-[#2a3942] flex items-center justify-center mx-auto mb-6">
        <svg viewBox="0 0 24 24" className="w-14 h-14 fill-[#8696a0]">
          <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896.002-3.176-1.24-6.165-3.48-8.45z" />
        </svg>
      </div>
      <h2 className="text-[#e9edef] text-2xl font-light mb-3">TarsChat Web</h2>
      <p className="text-[#8696a0] text-sm max-w-sm leading-relaxed">
        Select a conversation from the sidebar, or click the{" "}
        <strong className="text-[#e9edef]">People</strong> tab to find someone
        to chat with.
      </p>
      <div className="flex items-center gap-2 text-[#8696a0] text-xs mt-6">
        <div className="w-2 h-2 rounded-full bg-[#00a884]" />
        End-to-end encrypted
      </div>
    </div>
  );
}

