"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";

import { verifyEmailAction, resendVerificationAction } from "@/features/auth";

import FlexBox from "@component/ui/FlexBox";
import TextField from "@component/ui/form/text-field";
import { Button } from "@component/ui/buttons";
import { H3, Paragraph } from "@component/ui/Typography";
import { AuthWrapper, StyledRoot } from "./styles";

type Status = "loading" | "success" | "error" | "resend";

export default function VerifyEmail() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "loading" : "resend");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    const result = await verifyEmailAction(verificationToken);

    if (result.success) {
      setStatus("success");
      setMessage(result.message || t("verifyEmail.success"));
    } else {
      setStatus("error");
      setMessage(result.error || t("verifyEmail.error"));
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    const result = await resendVerificationAction(email);

    if (result.success) {
      setMessage(result.message || t("verifyEmail.resendSuccess"));
    } else {
      setMessage(result.error || t("verifyEmail.resendError"));
    }
    setIsResending(false);
  };

  return (
    <AuthWrapper>
      <StyledRoot>
        <div className="content" style={{ paddingBottom: "2rem", textAlign: "center" }}>
          {status === "loading" && (
            <>
              <FlexBox justifyContent="center" mb="1rem">
                <IconLoader2 size={48} className="animate-spin" color="#2563eb" />
              </FlexBox>
              <H3 mb="1rem">{t("verifyEmail.verifying")}</H3>
              <Paragraph color="gray.600">{t("verifyEmail.pleaseWait")}</Paragraph>
            </>
          )}

          {status === "success" && (
            <>
              <FlexBox
                justifyContent="center"
                alignItems="center"
                mb="1rem"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#dcfce7",
                  margin: "0 auto 1rem",
                }}
              >
                <IconCheck size={32} color="#16a34a" />
              </FlexBox>
              <H3 mb="1rem" color="success.main">
                {t("verifyEmail.successTitle")}
              </H3>
              <Paragraph mb="1.5rem">{message}</Paragraph>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => router.push("/signin")}
              >
                {t("verifyEmail.goToSignin")}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <FlexBox
                justifyContent="center"
                alignItems="center"
                mb="1rem"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#fee2e2",
                  margin: "0 auto 1rem",
                }}
              >
                <IconX size={32} color="#dc2626" />
              </FlexBox>
              <H3 mb="1rem" color="error.main">
                {t("verifyEmail.errorTitle")}
              </H3>
              <Paragraph mb="1.5rem">{message}</Paragraph>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => setStatus("resend")}
              >
                {t("verifyEmail.resendLink")}
              </Button>
            </>
          )}

          {status === "resend" && (
            <>
              <H3 mb="1rem">{t("verifyEmail.resendTitle")}</H3>
              <Paragraph mb="1.5rem" color="gray.600">
                {t("verifyEmail.resendDescription")}
              </Paragraph>

              {message && (
                <Paragraph
                  mb="1rem"
                  color={message.includes("erreur") ? "error.main" : "success.main"}
                >
                  {message}
                </Paragraph>
              )}

              <TextField
                fullWidth
                mb="1rem"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@mail.com"
                label={t("verifyEmail.emailLabel")}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={isResending || !email}
                onClick={handleResend}
              >
                {isResending ? t("verifyEmail.sending") : t("verifyEmail.sendButton")}
              </Button>
            </>
          )}
        </div>
      </StyledRoot>
    </AuthWrapper>
  );
}
