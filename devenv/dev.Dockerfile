FROM buildpack-deps:bullseye-curl

ARG USER="dev"
ARG GROUP="dev"

# setup user and dev tools:
ARG INSTALL_ZSH="true"
ARG UPGRADE_PACKAGES="true"
ARG USERNAME=${USER}
ARG USER_UID="automatic"
ARG USER_GID="automatic"
COPY ./*.sh ./*.env /tmp/library-scripts/
RUN bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" "true" "true" \
	&& apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/library-scripts

# install prerequisites not part of common-debian:
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
	&& apt-get install -y --no-install-recommends \
	gcc-multilib \
	ninja-build \
	cmake \
	libudev-dev \
	python3 \
	python3-pip \
	libusb-1.0-0 \
	libssl-dev \
	pkg-config \
	libtinfo5 \
	xz-utils \
	&& rm -rf /var/lib/apt/lists/*

# RUN groupadd -r ${GROUP} && useradd --no-log-init -m -g ${GROUP} ${USER}
# USER ${USER}

USER dev

# general PATH extensions and other ENV vars
ENV HOME="/home/${USER}"
ENV PATH="${HOME}/.espressif/tools/xtensa-esp32-elf-clang/esp-14.0.0-20220415-x86_64-unknown-linux-gnu/bin/:${HOME}/.cargo/bin:${PATH}"
ENV LIBCLANG_PATH="${HOME}/.espressif/tools/xtensa-esp32-elf-clang/esp-14.0.0-20220415-x86_64-unknown-linux-gnu/lib/"
ENV PIP_USER="no"

# install rustup under the dev user instead of root:
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN . /home/${USER}/.cargo/env

# setup ESP rust toolchain: https://github.com/esp-rs/rust-build
RUN git clone https://github.com/esp-rs/rust-build.git /tmp/esp-rust-build
RUN (cd /tmp/esp-rust-build && ./install-rust-toolchain.sh)

# install and setup tooling
RUN rustup default esp
RUN cargo install espflash espmonitor
RUN pip install --user esptool

