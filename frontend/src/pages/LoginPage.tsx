import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import frame2Image from "@/assets/Frame 2.png";
import { request, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/context/auth";

type VerifyResponse = {
  token: string;
  user: { id: string; email: string; name?: string };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login } = useAuth();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    if (resendSeconds === 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const sendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      await request<ApiResponse<null>>("/api/auth/send-otp", {
        method: "POST",
        auth: false,
        body: { email },
      });
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setResendSeconds(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await request<ApiResponse<VerifyResponse>>("/api/auth/verify-otp", {
        method: "POST",
        auth: false,
        body: { email, otp: otp.join("") },
      });

      login({ token: response.data.token, user: response.data.user });
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const ch = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = ch;
      return next;
    });
    setError("");
    if (ch && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpPaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    event.preventDefault();
    setError("");

    setOtp((current) => {
      const next = [...current];
      pasted.split("").forEach((digit, offset) => {
        if (index + offset < next.length) next[index + offset] = digit;
      });
      return next;
    });

    inputsRef.current[Math.min(index + pasted.length, 5)]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex items-center justify-center p-2">
        <img
          src={frame2Image}
          alt="Productr banner"
          className="w-full max-h-[86vh] rounded-3xl object-contain"
        />
      </div>

      <div className="flex flex-col items-center justify-between px-6 py-10 lg:py-16">
        <div className="w-full max-w-sm mt-12 lg:mt-24">
          <h1 className="text-2xl font-bold text-[#111652] mb-4">Login to your Productr Account</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Enter your email and we'll send you a one-time password.
          </p>

          {step === "email" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) void sendOtp();
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email or Phone Number</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-11 bg-[#071074] text-white rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Due to TRAI regulations, mobile OTP service is currently unavailable. Only email OTP is supported.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If the server has been idle for a long time, please wait about a minute for it to respond.
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Enter OTP</label>
                <div className="flex w-full justify-between gap-2">
                  {otp.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={value}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onPaste={(event) => handleOtpPaste(index, event)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      ref={(element) => {
                        inputsRef.current[index] = element;
                      }}
                      className="w-10 h-11 rounded-md border border-input text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  ))}
                </div>
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full h-11 bg-[#071074] text-white rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify and Login"}
              </button>

              <div className="w-full text-center mt-4">
                <p className="text-sm text-muted-foreground inline-block">
                  Didn't receive the OTP?
                  {resendSeconds > 0 ? (
                    <span className="text-primary font-semibold ml-2">Resend in {resendSeconds}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void sendOtp()}
                      className="text-primary font-semibold ml-2 hover:underline"
                    >
                      Resend
                    </button>
                  )}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
