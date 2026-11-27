package com.lostandfound.repo;

import com.lostandfound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; 

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findBySessionToken(String sessionToken);
}