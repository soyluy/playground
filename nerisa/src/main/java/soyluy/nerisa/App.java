package soyluy.nerisa;

import javafx.application.Application;
import javafx.stage.Stage;


public class App extends Application {
	
	@Override
	public void start(Stage stage){
		stage.setTitle("Nerisa - Week Planner");
		MainView view = new MainView();
		stage.setScene(view.buildScene());
		stage.show();
	}

}
