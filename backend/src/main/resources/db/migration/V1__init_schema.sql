CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Amman',
    default_sla_minutes INT DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'invited',
    on_shift BOOLEAN DEFAULT false,
    current_load INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, phone)
);
CREATE INDEX idx_agents_company_id ON agents(company_id);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    reference_code VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30),
    address TEXT NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL,
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    at_risk BOOLEAN DEFAULT false,
    breached BOOLEAN DEFAULT false,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, reference_code)
);
CREATE INDEX idx_tasks_company_status ON tasks(company_id, status);
CREATE INDEX idx_tasks_company_sla ON tasks(company_id, sla_deadline);

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    agent_id UUID REFERENCES agents(id) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assignment_method VARCHAR(20) NOT NULL,
    unassigned_at TIMESTAMP WITH TIME ZONE
);
CREATE UNIQUE INDEX idx_assignments_active_per_task ON assignments(task_id) WHERE unassigned_at IS NULL;

CREATE TABLE status_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_status_events_task_id ON status_events(task_id);
