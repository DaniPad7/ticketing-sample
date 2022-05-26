import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket =  Ticket.build({
        title: 'Concert',
        price: 500,
        userId: 'djkdjnk'
    });

    // Save the ticket to DB
    await ticket.save();

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Make two seperate changes to the tickets we fetched
    firstInstance!.set({ price: 100 });
    secondInstance!.set({ price: 250 });

    // Save the first fetched ticket
    await firstInstance!.save();

    // Save the second fetched ticket and expect an error
    try {
        await secondInstance!.save();    

    } catch(err) {
        return;
    };
    throw new Error('Should not reach this point.');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: "Concert",
        price: 200,
        userId: '3dj8drdd'
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});