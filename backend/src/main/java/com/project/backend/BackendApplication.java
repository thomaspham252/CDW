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
	public CommandLineRunner initAdminUser(
			UserRepository userRepository, 
			com.project.backend.repository.product.ProductVariantRepository variantRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// Initialize null stocks to 50
			try {
				variantRepository.findAll().forEach(v -> {
					if (v.getStock() == null) {
						v.setStock(50);
						variantRepository.save(v);
					}
				});
				System.out.println(">>> Initialized null stock values for all variants to 50! <<<");
			} catch (Exception e) {
				System.err.println("Error initializing stock values: " + e.getMessage());
			}

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
			// Khởi tạo tài khoản staff mẫu
			String staffEmail = "staff@tthshop.com";
			String staffPassword = "password";
			userRepository.findByEmail(staffEmail).ifPresentOrElse(
				user -> {
					user.setPasswordHash(passwordEncoder.encode(staffPassword));
					user.setRole("STAFF");
					if (user.getFullname() == null || user.getFullname().isEmpty()) {
						user.setFullname("Nhân viên TTH");
					}
					userRepository.save(user);
					System.out.println(">>> Updated staff user successfully! <<<");
				},
				() -> {
					User staff = User.builder()
							.email(staffEmail)
							.fullname("Nhân viên TTH")
							.passwordHash(passwordEncoder.encode(staffPassword))
							.role("STAFF")
							.build();
					userRepository.save(staff);
					System.out.println(">>> Created staff user successfully! <<<");
				}
			);
		};
	}
}

