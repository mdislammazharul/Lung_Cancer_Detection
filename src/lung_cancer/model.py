from tensorflow import keras
from keras import layers


def build_cnn(img_size: int, num_classes: int = 3) -> keras.Model:
    model = keras.models.Sequential([
        layers.Input(shape=(img_size, img_size, 3)),

        layers.Conv2D(32, (5, 5), activation="relu", padding="same"),
        layers.MaxPooling2D(2, 2),

        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.MaxPooling2D(2, 2),

        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.MaxPooling2D(2, 2),

        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.BatchNormalization(),

        layers.Dense(128, activation="relu"),
        layers.Dropout(0.3),
        layers.BatchNormalization(),

        layers.Dense(num_classes, activation="softmax"),
    ])

    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model
