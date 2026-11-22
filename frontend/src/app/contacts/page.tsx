import type { Metadata } from "next";
import { ContactsScreen } from "@/components/project/contacts-screen";

export const metadata: Metadata = {
    title: "Контакти",
    description: "Як зв'язатися з командою Eco Guard, повідомити про помилку на карті чи додати свій пункт прийому.",
};

export default function ContactsPage() {
    return <ContactsScreen />;
}
