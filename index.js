const net = require('net');

// Define the port number for the network
const PORT = 8080;

// Define an array to store the addresses of other nodes in the network
const nodeAddresses = [];

// Create a server to listen for incoming connections from other nodes
const server = net.createServer(socket => {
  console.log('Node connected:', socket.remoteAddress);
  
  // Add the node's address to the list of node addresses
  nodeAddresses.push(socket.remoteAddress);

  // Listen for data (messages) from the connected node
  socket.on('data', data => {
    console.log(`Received message from ${socket.remoteAddress}: ${data}`);
    
    // Forward the message to all other nodes in the network
    nodeAddresses.forEach(address => {
      // Don't send the message back to the original sender
      if (address !== socket.remoteAddress) {
        const forwardSocket = net.createConnection({ port: PORT, host: address });
        forwardSocket.write(data);
        forwardSocket.end();
      }
    });
  });

  // Listen for the node to disconnect
  socket.on('end', () => {
    console.log('Node disconnected:', socket.remoteAddress);
    
    // Remove the node's address from the list of node addresses
    const index = nodeAddresses.indexOf(socket.remoteAddress);
    if (index > -1) {
      nodeAddresses.splice(index, 1);
    }
  });
});

// Start the server to listen for incoming connections
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Connect to other nodes in the network
const connectToNode = address => {
  const socket = net.createConnection({ port: PORT, host: address });

  // Listen for data (messages) from the connected node
  socket.on('data', data => {
    console.log(`Received message from ${address}: ${data}`);
  });

  // Listen for the connection to close
  socket.on('close', () => {
    console.log(`Disconnected from ${address}`);
  });

  // Handle errors
  socket.on('error', error => {
    console.error(`Error connecting to ${address}: ${error}`);
  });
};

// Example usage: connect to two nodes and send a message
connectToNode('192.168.0.187');

setTimeout(() => {
  const message = 'Hello, world!';
  nodeAddresses.forEach(address => {
    const socket = net.createConnection({ port: PORT, host: address });
    socket.write(message);
    socket.end();
  });
}, 1000);
