package com.api.edutrack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "social_logins", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "provider", "providerId" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLogin {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(nullable = false, length = 60)
	private String provider;

	@Column(nullable = false, length = 255)
	private String providerId;
}