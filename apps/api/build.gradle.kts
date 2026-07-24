plugins {
    java
    id("org.springframework.boot") version "3.4.1"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.springdoc.openapi-gradle-plugin") version "1.8.0"
}

group = "com.spellbound"
version = "0.1.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

// Spring Boot 3.4.1 manages Testcontainers 1.20.4. Overridden to the latest
// stable release for Windows/Docker Desktop named-pipe compatibility fixes.
dependencyManagement {
    imports {
        mavenBom("org.testcontainers:testcontainers-bom:1.21.3")
    }
}

val mapstructVersion = "1.6.3"

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    implementation("org.flywaydb:flyway-core")
    runtimeOnly("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")

    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0")

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    implementation("org.mapstruct:mapstruct:$mapstructVersion")
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// openapi-gradle-plugin's forkedSpringBootRun task fails Gradle 8.11's
// stricter input tracking on Windows (tries to hash workingDir as file
// content). Untracked because it has no meaningful cacheable inputs anyway -
// it just boots the app long enough to scrape the OpenAPI spec.
tasks.named("forkedSpringBootRun") {
    doNotTrackState("workingDir input tracking is broken for this task on Windows")
}

// Used by the CI "contract" job to verify the committed openapi.yaml has not
// drifted from what the running application actually exposes. Boots the app
// under the `docs` profile, which excludes the datasource/Redis so this works
// on a bare CI runner with no infrastructure containers.
openApi {
    apiDocsUrl.set("http://localhost:8080/v3/api-docs.yaml")
    customBootRun {
        args.set(listOf("--spring.profiles.active=docs"))
    }
    outputDir.set(layout.buildDirectory.get().asFile)
    outputFileName.set("openapi.yaml")
    waitTimeInSeconds.set(60)
}
