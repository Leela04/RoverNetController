import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains the same as provided in the template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Rover schema
export const rovers = pgTable("rovers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  identifier: text("identifier").notNull().unique(),
  connected: boolean("connected").default(false),
  status: text("status").default("disconnected"), // disconnected, idle, active, error
  batteryLevel: integer("battery_level").default(100),
  batteryUpdatedAt: timestamp("battery_updated_at"), // <-- New column
  lastSeen: timestamp("last_seen"),
  ipAddress: text("ip_address"),
  metadata: json("metadata")
});

export const insertRoverSchema = createInsertSchema(rovers).pick({
  name: true,
  identifier: true,
  ipAddress: true,
});

// Sensor Data schema
export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  roverId: integer("rover_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  temperature: real("temperature"),
  //*humidity: real("humidity"),
  //*pressure: real("pressure"),
  //*altitude: real("altitude"),
  //*heading: real("heading"),
  //*speed: real("speed"),
  //*tilt: real("tilt"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  batteryLevel: integer("battery_level"),
  signalStrength: integer("signal_strength"),
  cpuUsage: real("cpu_usage"), // % CPU usage (e.g., 35.25)
  memoryUsage: real("memory_usage"), // % Memory usage (e.g., 65.75)
  

});

export const insertSensorDataSchema = createInsertSchema(sensorData).pick({
  roverId: true,
  temperature: true,
  //*humidity: true,
  //*pressure: true,
  //*altitude: true,
  //*heading: true,
  //*speed: true,
  //*tilt: true,
  latitude: true,
  longitude: true,
  batteryLevel: true,
  signalStrength: true,
  cpuUsage: true,
  memoryUsage: true,


});

// Command Log schema
export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  roverId: integer("rover_id").notNull(), //*integer to text
  command: text("command").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").default("pending"), // pending, success, failed
  response: text("response")
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).pick({
  roverId: true,
  command: true,
  status: true,
  response: true,
});

// Rover Client schema - for socket connections
export const roverClients = pgTable("rover_clients", {
  id: serial("id").primaryKey(),
  roverId: integer("rover_id").notNull(), //*integer to text
  connected: boolean("connected").default(false),
  lastPing: timestamp("last_ping"),
  socketId: text("socket_id")
});

export const insertRoverClientSchema = createInsertSchema(roverClients).pick({
  roverId: true,
  connected: true,
  socketId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Rover = typeof rovers.$inferSelect;
export type InsertRover = z.infer<typeof insertRoverSchema>;

export type SensorData = typeof sensorData.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;

export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;

export type RoverClient = typeof roverClients.$inferSelect;
export type InsertRoverClient = z.infer<typeof insertRoverClientSchema>;

// Message types for WebSocket communication
export const messageSchema = z.object({
  type: z.enum([
    'CONNECT', 
    'DISCONNECT', 
    'COMMAND', 
    'TELEMETRY',
    "COMMAND_RESPONSE", 
    'STATUS_UPDATE', 
    'ERROR'
  ]),
  payload: z.any(),
  timestamp: z.number().default(() => Date.now()),
  roverId: z.union([z.string(), z.number()]).optional(), // Allow both string or number for roverId

  //*roverId: z.number().optional(),
  roverIdentifier: z.string().optional(),
});

export type WebSocketMessage = z.infer<typeof messageSchema>;
