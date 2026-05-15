package com.api.edutrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.edutrack.entity.SocialLogin;

public interface SocialLoginRepository extends JpaRepository<SocialLogin, Long> {

	Optional<SocialLogin> findByProviderAndProviderId(String provider, String providerId);
}