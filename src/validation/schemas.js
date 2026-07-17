'use strict';
const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  preferences: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const preferencesSchema = z.object({
  preferences: z.array(z.string()),
});

module.exports = { signupSchema, loginSchema, preferencesSchema };
