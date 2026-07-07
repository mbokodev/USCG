"use client";

import { useState } from "react";
import Box from "@component/ui/Box";
import FlexBox from "@component/ui/FlexBox";
import { H6, Paragraph } from "@component/ui/Typography";
import TiptapViewer from "@component/ui/TiptapViewer";
import { Accordion, AccordionHeader } from "@component/ui/accordion";
import type { IFaq } from "@uscg/shared/types";

interface FaqAccordionProps {
  faqs: IFaq[];
  locale: "fr" | "en";
}

export default function FaqAccordion({ faqs, locale }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <Box>
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        const question = faq.question[locale] || faq.question.fr;
        const answer = faq.answer[locale] || faq.answer.fr;

        return (
          <Box
            key={faq.id}
            mb="12px"
            borderRadius={12}
            overflow="hidden"
            style={{
              border: isOpen ? "1px solid #E94560" : "1px solid #eee",
              transition: "border-color 0.2s ease",
            }}
          >
            <Accordion expanded={isOpen}>
              <AccordionHeader
                px="1.25rem"
                py="1rem"
                onClick={() => handleToggle(faq.id)}
                style={{
                  backgroundColor: isOpen ? "#FFF5F7" : "#FAFAFA",
                  transition: "background-color 0.2s ease",
                }}
              >
                <FlexBox alignItems="center" flex={1}>
                  <H6
                    fontWeight={600}
                    fontSize="15px"
                    color={isOpen ? "primary.main" : "text.primary"}
                    style={{
                      transition: "color 0.2s ease",
                    }}
                  >
                    {question}
                  </H6>
                </FlexBox>
              </AccordionHeader>

              <Box
                px="1.25rem"
                py="1rem"
                bg="white"
                style={{
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <TiptapViewer content={answer} />
              </Box>
            </Accordion>
          </Box>
        );
      })}
    </Box>
  );
}
