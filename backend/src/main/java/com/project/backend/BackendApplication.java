package com.project.backend;

import com.project.backend.entity.auth.User;
import com.project.backend.repository.auth.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String adminEmail = "22130143@st.hcmuaf.edu.vn";
			String defaultPassword = "password";
			userRepository.findByEmail(adminEmail).ifPresentOrElse(
				user -> {
					user.setPasswordHash(passwordEncoder.encode(defaultPassword));
					user.setRole("ADMIN");
					if (user.getFullname() == null || user.getFullname().isEmpty()) {
						user.setFullname("Admin");
					}
					userRepository.save(user);
					System.out.println(">>> Updated admin user password hash and role successfully! <<<");
				},
				() -> {
					User admin = User.builder()
							.email(adminEmail)
							.fullname("Admin")
							.passwordHash(passwordEncoder.encode(defaultPassword))
							.role("ADMIN")
							.build();
					userRepository.save(admin);
					System.out.println(">>> Created admin user with ADMIN role successfully! <<<");
				}
			);
		};
	}
}

