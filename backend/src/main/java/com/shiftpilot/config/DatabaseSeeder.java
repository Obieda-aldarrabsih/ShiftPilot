package com.shiftpilot.config;

import com.shiftpilot.domain.Agent;
import com.shiftpilot.domain.Company;
import com.shiftpilot.domain.Task;
import com.shiftpilot.domain.User;
import com.shiftpilot.repository.AgentRepository;
import com.shiftpilot.repository.CompanyRepository;
import com.shiftpilot.repository.TaskRepository;
import com.shiftpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (companyRepository.count() > 0) {
            return;
        }

        Company company = Company.builder()
                .name("Fast Delivery Co.")
                .serviceType("delivery")
                .timezone("Asia/Amman")
                .defaultSlaMinutes(120)
                .build();
        company = companyRepository.save(company);

        User dispatcher = User.builder()
                .company(company)
                .email("dispatcher@fastdelivery.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("DISPATCHER")
                .build();
        userRepository.save(dispatcher);

        Agent agentOmar = Agent.builder()
                .company(company)
                .fullName("Omar, 24, delivery driver")
                .phone("+962790000001")
                .pinHash(passwordEncoder.encode("1234"))
                .status("ACTIVE")
                .onShift(true)
                .currentLoad(0)
                .build();
        agentRepository.save(agentOmar);

        Agent agentSami = Agent.builder()
                .company(company)
                .fullName("Sami, Field Agent")
                .phone("+962790000002")
                .pinHash(passwordEncoder.encode("1234"))
                .status("ACTIVE")
                .onShift(true)
                .currentLoad(0)
                .build();
        agentRepository.save(agentSami);

        Task task1 = Task.builder()
                .company(company)
                .referenceCode("TSK-001")
                .customerName("Lina")
                .customerPhone("+962790000003")
                .address("Amman, 7th Circle")
                .taskType("Delivery")
                .notes("Call upon arrival")
                .status("UNASSIGNED")
                .slaDeadline(ZonedDateTime.now().plusHours(2))
                .build();
        taskRepository.save(task1);

        Task task2 = Task.builder()
                .company(company)
                .referenceCode("TSK-002")
                .customerName("Ahmed")
                .customerPhone("+962790000004")
                .address("Amman, Abdoun")
                .taskType("Home Service")
                .notes("Fix AC")
                .status("UNASSIGNED")
                .slaDeadline(ZonedDateTime.now().plusHours(1))
                .build();
        taskRepository.save(task2);

        System.out.println("Database seeded successfully.");
    }
}
