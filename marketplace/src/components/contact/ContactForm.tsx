"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Box from "@component/ui/Box";
import FlexBox from "@component/ui/FlexBox";
import { H3, Paragraph } from "@component/ui/Typography";
import { submitContactForm } from "@/services/contact.service";

interface ContactFormProps {
  locale: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export default function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations("staticPages.contact.form");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error?.message || t("errorGeneric"));
    }
  };

  if (status === "success") {
    return (
      <Box
        p="2rem"
        borderRadius={16}
        textAlign="center"
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          border: "1px solid #bbf7d0",
        }}
      >
        <FlexBox
          width={64}
          height={64}
          bg="white"
          borderRadius="50%"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb="1rem"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <CheckCircle size={32} color="#22c55e" />
        </FlexBox>
        <H3 color="text.primary" fontSize="1.1rem" mb="0.5rem">
          {t("successTitle")}
        </H3>
        <Paragraph color="text.secondary" fontSize="14px" mb="1rem">
          {t("successMessage")}
        </Paragraph>
        <button
          onClick={() => setStatus("idle")}
          style={{
            background: "none",
            border: "none",
            color: "#22c55e",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {t("sendAnother")}
        </button>
      </Box>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p="1.5rem"
      borderRadius={16}
      style={{
        background: "#fff",
        border: "1px solid #eee",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Error Message */}
      {status === "error" && (
        <FlexBox
          alignItems="center"
          gap="0.5rem"
          p="1rem"
          mb="1rem"
          borderRadius={8}
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <Paragraph color="error.main" fontSize="14px" mb="0">
            {errorMessage}
          </Paragraph>
        </FlexBox>
      )}

      {/* Name */}
      <Box mb="1rem">
        <label
          htmlFor="name"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          {t("name")} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "15px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#E94560")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </Box>

      {/* Email */}
      <Box mb="1rem">
        <label
          htmlFor="email"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          {t("email")} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "15px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#E94560")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </Box>

      {/* Subject */}
      <Box mb="1rem">
        <label
          htmlFor="subject"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          {t("subject")} *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          maxLength={200}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "15px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#E94560")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </Box>

      {/* Message */}
      <Box mb="1.5rem">
        <label
          htmlFor="message"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          {t("message")} *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "15px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            outline: "none",
            transition: "border-color 0.2s",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#E94560")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <Paragraph color="text.muted" fontSize="12px" mt="4px" mb="0">
          {t("messageHint")}
        </Paragraph>
      </Box>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "15px",
          fontWeight: 600,
          color: "#fff",
          background: status === "loading" ? "#f87171" : "#E94560",
          border: "none",
          borderRadius: "10px",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background 0.2s",
        }}
      >
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t("sending")}
          </>
        ) : (
          <>
            <Send size={18} />
            {t("submit")}
          </>
        )}
      </button>
    </Box>
  );
}
