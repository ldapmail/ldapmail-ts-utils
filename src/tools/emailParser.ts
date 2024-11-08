export default function (email: string): { name: string, domain: string } {
    const [name, domain] = email.split('@').filter(Boolean).filter(part => part && part.trim());
    if (!name || !domain) throw new Error('Invalid email format. Please provide a valid email address.');

    return {
        name,
        domain
    };
}