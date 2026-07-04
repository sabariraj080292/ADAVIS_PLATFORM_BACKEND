package com.adavis.mdm.repository;

import com.adavis.mdm.model.entity.DmsDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DmsDocumentRepository extends MongoRepository<DmsDocument, String> {

    Optional<DmsDocument> findByDocumentId(String documentId);
}
