import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';
import bcrypt from 'bcryptjs';
import { aiService } from '../../services/ai.service';

export async function authRoutes(fastify: FastifyInstance) {
  
  // POST /api/v1/auth/signup - Register new Tenant (Company) & Admin User
  fastify.post('/signup', async (request, reply) => {
    const { 
      companyName, email, password,
      employeeCount, numberOfBranches, annualTurnover, 
      gstin, businessType, dataSensitivity, 
      expectedTxVolume, enterpriseRequirements 
    } = request.body as any;

    if (!companyName || !email || !password) {
      return reply.status(400).send({ error: 'Missing required base fields' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // AI-driven Smart Routing Logic
    const routingDecision = await aiService.determineRoutingStrategy({
      companyName, employeeCount, numberOfBranches, annualTurnover,
      businessType, dataSensitivity, expectedTxVolume, enterpriseRequirements
    });

    // Create Tenant and User transactionally
    try {
      const newTenant = await prisma.tenant.create({
        data: {
          name: companyName,
          routingStrategy: routingDecision.strategy,
          routingReason: routingDecision.reason,
          employeeCount: employeeCount ? parseInt(employeeCount) : null,
          numberOfBranches: numberOfBranches ? parseInt(numberOfBranches) : null,
          annualTurnover: annualTurnover ? parseFloat(annualTurnover) : null,
          gstin,
          businessType,
          dataSensitivity: dataSensitivity || 'STANDARD',
          expectedTxVolume: expectedTxVolume ? parseInt(expectedTxVolume) : null,
          enterpriseRequirements,
          users: {
            create: {
              email,
              password: hashedPassword,
            }
          }
        },
        include: { users: true }
      });

      const user = newTenant.users[0];

      // Generate JWT
      const token = fastify.jwt.sign({
        tenantId: newTenant.id,
        userId: user.id,
        routingStrategy: newTenant.routingStrategy
      }, { expiresIn: '7d' });

      return reply.status(201).send({
        message: 'Tenant and User created successfully',
        token,
        tenant: { 
          id: newTenant.id, 
          name: newTenant.name, 
          routingStrategy: newTenant.routingStrategy,
          dataSensitivity: newTenant.dataSensitivity
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'Email or Company Name already exists' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error during registration', details: error.message });
    }
  });

  // POST /api/v1/auth/login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = fastify.jwt.sign({
      tenantId: user.tenant.id,
      userId: user.id,
      routingStrategy: user.tenant.routingStrategy
    }, { expiresIn: '7d' });

    return reply.status(200).send({
      token,
      tenant: { 
        id: user.tenant.id, 
        name: user.tenant.name,
        routingStrategy: user.tenant.routingStrategy,
        dataSensitivity: user.tenant.dataSensitivity
      }
    });
  });
}
