const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import the CORS package
const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all origins (allow requests from any origin)
app.use(cors());

// Middleware to parse JSON bodies from requests
app.use(express.json());

// Path to the tickets.json file
const ticketsFilePath = path.join(__dirname, 'json_data', 'tickets.json');

// Helper function to read tickets data from the JSON file
const readTicketsData = () => {
  try {
    if (fs.existsSync(ticketsFilePath)) {
      console.log('Reading tickets.json file...');
      const data = fs.readFileSync(ticketsFilePath, 'utf8');
      console.log('File content:', data); // Log the file content
      return JSON.parse(data);
    } else {
      console.log('tickets.json file not found. Returning empty array.');
      return { tickets: [] };
    }
  } catch (error) {
    console.error('Error reading the file:', error);
    return { tickets: [] };
  }
};

// Helper function to write tickets data to the JSON file
const writeTicketsData = (data) => {
  try {
    fs.writeFileSync(ticketsFilePath, JSON.stringify(data, null, 2));
    console.log('Data written to tickets.json:', data); // Log the written data
  } catch (error) {
    console.error('Error writing to the file:', error);
  }
};

// Endpoint to get all tickets
app.get('/tickets', (req, res) => {
  console.log('Fetching tickets...');
  const ticketsData = readTicketsData();
  console.log('Tickets data:', ticketsData); // Log the tickets data
  res.json(ticketsData);
});

// Endpoint to update ticket status (PATCH)
app.patch('/tickets/:id', (req, res) => {
  const ticketId = req.params.id;
  const newStatus = req.body.status;

  if (!newStatus) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const ticketsData = readTicketsData();
  const ticketIndex = ticketsData.tickets.findIndex((ticket) => ticket.id === ticketId);

  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Update the status of the ticket
  ticketsData.tickets[ticketIndex].status = newStatus;

  // Save the updated data to the JSON file
  writeTicketsData(ticketsData);

  res.status(200).json({ message: 'Ticket status updated', ticket: ticketsData.tickets[ticketIndex] });
});

// Endpoint to add a new ticket
app.post('/tickets', (req, res) => {
  const newTicket = req.body;

  // Ensure the ticket has the required fields
  if (!newTicket.id || !newTicket.customerName || !newTicket.issueType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ticketsData = readTicketsData();
  ticketsData.tickets.push(newTicket);

  // Save the updated data to the JSON file
  writeTicketsData(ticketsData);

  res.status(201).json({ message: 'Ticket added successfully', newTicket });
});

// Endpoint to delete a ticket
app.delete('/tickets/:id', (req, res) => {
  const ticketId = req.params.id;

  const ticketsData = readTicketsData();
  const ticketIndex = ticketsData.tickets.findIndex((ticket) => ticket.id === ticketId);

  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Remove the ticket from the array
  const deletedTicket = ticketsData.tickets.splice(ticketIndex, 1);

  // Save the updated data to the JSON file
  writeTicketsData(ticketsData);

  res.status(200).json({ message: 'Ticket deleted successfully', deletedTicket });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});