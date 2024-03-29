import { ticketModel } from "../models/ticket.model.js";

export default class TicketManager {

    async createTicket(cart, totalAmount, purchaser) {
        const ticket = new ticketModel({
            code: Math.floor(Math.random() * 1000000).toString(),
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser: purchaser
        });

        const savedTicket = await ticket.save();
        return savedTicket;
    }
}
