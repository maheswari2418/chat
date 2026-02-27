// import { SignIn } from "@clerk/nextjs";

// export default function SignInPage() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//       <SignIn />
//     </div>
//   );
// }
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111b21]">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896.002-3.176-1.24-6.165-3.48-8.45z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              TarsChat
            </h1>
          </div>
          <p className="text-[#8696a0] text-sm">
            Sign in to start messaging
          </p>
        </div>

        {/* Clerk Prebuilt SignIn — styled to match dark theme */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#202c33] border border-[#2a3942] shadow-2xl rounded-2xl",
              headerTitle: "text-[#e9edef] text-xl font-semibold",
              headerSubtitle: "text-[#8696a0]",
              socialButtonsBlockButton:
                "bg-[#2a3942] border border-[#3d5163] text-[#e9edef] hover:bg-[#3d5163] transition-colors rounded-xl",
              socialButtonsBlockButtonText: "text-[#e9edef] font-medium",
              dividerLine: "bg-[#2a3942]",
              dividerText: "text-[#8696a0] text-xs",
              formFieldLabel: "text-[#8696a0] text-sm",
              formFieldInput:
                "bg-[#2a3942] border border-[#3d5163] text-[#e9edef] placeholder:text-[#8696a0] rounded-xl focus:ring-1 focus:ring-[#00a884] focus:border-[#00a884]",
              formButtonPrimary:
                "bg-[#00a884] hover:bg-[#02b893] text-white font-semibold rounded-xl shadow-md transition-colors",
              footerActionText: "text-[#8696a0]",
              footerActionLink:
                "text-[#00a884] hover:text-[#02b893] font-medium",
              identityPreviewText: "text-[#e9edef]",
              identityPreviewEditButton: "text-[#00a884]",
              formFieldSuccessText: "text-[#00a884]",
              alertText: "text-red-400",
              alertIcon: "text-red-400",
              otpCodeFieldInput:
                "bg-[#2a3942] border-[#3d5163] text-[#e9edef] rounded-xl",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: false,
            },
          }}
        />
      </div>
    </div>
  );
}