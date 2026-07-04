package com.adavis.mdm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableCaching
@ComponentScan(basePackages = {"com.adavis.mdm", "com.adavis.common", "com.adavis.security"})
public class MdmServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MdmServiceApplication.class, args);
    }
}