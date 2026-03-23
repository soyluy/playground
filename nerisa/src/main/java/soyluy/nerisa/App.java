package soyluy.nerisa;

import javafx.application.Application;
import javafx.stage.Stage;


public class App extends Application {
	private static final String EMPTY_TEXT = "Please set a date";

	@Override
	public void start(Stage stage){
		MainView view = new MainView();
		stage.setScene(view.buildScene());
		stage.show();
	}

}
