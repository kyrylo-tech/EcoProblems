import { NewPointForm } from "@/components/points/new-point-form";
import { getCurrentUser } from "@/lib/current-user";

export default async function NewPointPage() {
    const user = await getCurrentUser();
    return <NewPointForm isAuthenticated={Boolean(user)} />;
}
