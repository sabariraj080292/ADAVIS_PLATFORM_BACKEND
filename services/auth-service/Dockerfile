FROM eclipse-temurin:21-jdk-jammy

RUN groupadd --system adavis && useradd --system --gid adavis --create-home adavis

WORKDIR /app
RUN mkdir -p /app/logs && chown -R adavis:adavis /app
COPY --chown=adavis:adavis target/*.jar app.jar

USER adavis
EXPOSE 9081

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]