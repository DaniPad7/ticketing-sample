import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        );
    });
    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    );
};
// For react , will use v.18 useDeferredvalue, startTransition, <Suspense></Suspense>, useId
LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
};

export default LandingPage;

/**const LandingPage = ({ currentUser }) => {
 * console.log(currentUser)
 * axios.get('/api/users/currentuser').catch(err => console.log(err.message));
 * 
 * return <h1>Landing Page</h1>
 * };
 */