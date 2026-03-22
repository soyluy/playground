package soyluy.nerisa;

import java.time.LocalDate;
import java.time.temporal.WeekFields;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.DatePicker;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;


public class App extends Application {
	private static final String EMPTY_TEXT = "Please set a date";

	@Override
	public void start(Stage stage){
		
		DatePicker datePicker = new DatePicker();

		Label lbl = new Label("Select a date");

		datePicker.setOnAction(e -> {
			LocalDate picked = datePicker.getValue();
			if(picked == null){
				lbl.setText(EMPTY_TEXT);
				return;
			}
			int c = picked.get(WeekFields.ISO.weekOfWeekBasedYear());
			lbl.setText("Week " + c);
		});

		VBox root = new VBox(10);
		root.getChildren().addAll(datePicker,  lbl);
		
		Scene scene = new Scene(root, 400, 300);
		stage.setScene(scene);
		stage.show();
	}

}
