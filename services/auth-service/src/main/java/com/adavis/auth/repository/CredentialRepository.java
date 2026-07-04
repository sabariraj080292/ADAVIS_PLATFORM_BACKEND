package com.adavis.auth.repository;

import com.adavis.auth.model.entity.Credential;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CredentialRepository extends MongoRepository<Credential, String> {

    Optional<Credential> findByUserId(String userId);

    Optional<Credential> findByEmail(String email);
}
