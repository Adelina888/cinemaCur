package com.cinema.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.cinema.api.entity.Administrator;
import com.cinema.api.repository.AdministratorRepository;

@SpringBootApplication
@EnableScheduling
public class CinemaApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CinemaApiApplication.class, args);
	}
	@SuppressWarnings("unused")
	@Bean
	public CommandLineRunner init(AdministratorRepository adminRepo, PasswordEncoder passwordEncoder) {
		return args -> {
			if (adminRepo.findByLogin("admin").isEmpty()) {
				Administrator admin = new Administrator("Администратор", "admin", passwordEncoder.encode("admin123"));
				adminRepo.save(admin);
				System.out.println("Администратор создан: login=admin, password=admin123");
			}
		};
	}
}
