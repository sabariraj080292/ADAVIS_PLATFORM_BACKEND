FROM openjdk:21-jdk-slim

RUN groupadd --system adavis && useradd --system --gid adavis --create-home adavis

WORKDIR /app
COPY --chown=adavis:adavis target/license-service-*.jar app.jar

USER adavis
EXPOSE 8082

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]