package com.seatsync.userservice.repository;

import com.seatsync.userservice.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    List<UserActivity> findByEmailOrderByTimestampDesc(String email);
}
