import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';

export default function AccordionDisabled() {
  return (
    <Accordion className="max-w-md">
      <AccordionItem value="general">
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent>Workspace name, URL and time zone.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="sso" disabled>
        <AccordionTrigger>Single sign-on (Enterprise plan)</AccordionTrigger>
        <AccordionContent>Connect an identity provider with SAML or OIDC.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
