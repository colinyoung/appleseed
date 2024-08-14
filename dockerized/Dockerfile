# Define custom function directory
ARG FUNCTION_DIR="/function"

FROM --platform=linux/amd64 node:20 as build-image

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev \
    m4

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY app.js test.js package*.json ${FUNCTION_DIR}

WORKDIR ${FUNCTION_DIR}

# RUN npm install

# If the dependency is not in package.json uncomment the following line
RUN npm install

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# RUN npx playwright install chromium --with-deps

# Grab a fresh slim copy of the image to reduce the final size
FROM --platform=linux/amd64 node:20

# Required for Node runtimes which use npm@8.6.0+ because
# by default npm writes logs under /home/.npm and Lambda fs is read-only
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# Copy in the built dependencies
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}
# COPY --from=build-image /ms-playwright /ms-playwright

# Don't forget to set in lambda configuration as well
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN npx playwright install chromium --with-deps


ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["app.handler"]
