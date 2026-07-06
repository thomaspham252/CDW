package com.project.backend;

import com.project.backend.entity.auth.User;
import com.project.backend.repository.auth.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Khởi tạo Admin 1
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

			// Khởi tạo Admin 2
			String admin2Email = "ktam2811@gmail.com";
			String admin2Password = "123456";
			userRepository.findByEmail(admin2Email).ifPresentOrElse(
				user -> {
					user.setPasswordHash(passwordEncoder.encode(admin2Password));
					user.setRole("ADMIN");
					if (user.getFullname() == null || user.getFullname().isEmpty()) {
						user.setFullname("KTam Admin");
					}
					userRepository.save(user);
					System.out.println(">>> Updated admin user ktam2811@gmail.com successfully! <<<");
				},
				() -> {
					User admin2 = User.builder()
							.email(admin2Email)
							.fullname("KTam Admin")
							.passwordHash(passwordEncoder.encode(admin2Password))
							.role("ADMIN")
							.build();
					userRepository.save(admin2);
					System.out.println(">>> Created admin user ktam2811@gmail.com with ADMIN role successfully! <<<");
				}
			);
		};
	}
}

