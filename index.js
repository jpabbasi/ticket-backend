const express = require('express');
const cors = require('cors');

class TicketRepository {
    constructor() {
        this.tickets = [];
    }

    create(ticket) {
        this.tickets.push(ticket);
        return ticket;
    }

    findAll() {
        return [...this.tickets];
    }
}

class AssignmentStrategy {
    static skillBased(members, requiredSkill) {
        return members.find(m => m.skills.includes(requiredSkill)) || null;
    }
}

class TicketFactory {
    static create(data, assignee) {
        return {
            id: Date.now(),
            title: data.title,
            description: data.description,
            deadline: data.deadline,
            skill: data.skill,
            status: assignee ? "Assigned" : "Unassigned",
            assignee: assignee?.name || "None",
            createdAt: new Date().toISOString()
        };
    }
}

class TeamMembers {
    constructor() {
        if (!TeamMembers.instance) {
            this.members = [
                { id: 1, name: "Alice", skills: ["JavaScript", "React"] },
                { id: 2, name: "Bob", skills: ["Node.js", "Python"] },
                { id: 3, name: "Charlie", skills: ["Design", "CSS"] }
            ];
            TeamMembers.instance = this;
        }
        return TeamMembers.instance;
    }

    getAll() {
        return [...this.members];
    }
}

class TicketController {
    constructor() {
        this.repository = new TicketRepository();
        this.team = new TeamMembers();
    }

    handleCreateTicket(req, res) {
        try {
            const member = AssignmentStrategy.skillBased(
                this.team.members,
                req.body.skill
            );

            const ticket = TicketFactory.create(req.body, member);
            this.repository.create(ticket);

            res.status(201).json(ticket);
        } catch (error) {
            res.status(500).json({ error: 'Ticket creation failed' });
        }
    }

    handleGetTickets(req, res) {
        res.json(this.repository.findAll());
    }
}

class TeamMemberController {
    constructor() {
        this.team = new TeamMembers();
    }

    handleGetTeamMembers(req, res) {
        try {
            const members = this.team.getAll();
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch team members' });
        }
    }
}

const app = express();
app.use(cors());
app.use(express.json());

const ticketController = new TicketController();
const teamMemberController = new TeamMemberController();

app.post('/api/tickets', (req, res) => ticketController.handleCreateTicket(req, res));
app.get('/api/tickets', (req, res) => ticketController.handleGetTickets(req, res));
app.get('/api/teammembers', (req, res) => teamMemberController.handleGetTeamMembers(req, res));

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));