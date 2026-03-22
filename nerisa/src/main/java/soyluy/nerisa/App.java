package soyluy.nerisa;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.stage.Stage;


/**
 * Hello world!
 *
 */
public class App extends Application {
		@Override
		public void start(Stage stage){
			Scene scene = new Scene(new Label("Hello"), 400, 300);
			stage.setScene(scene);
			stage.show();
		}
}
