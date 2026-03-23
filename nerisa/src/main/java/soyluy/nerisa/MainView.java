package soyluy.nerisa;

import java.time.LocalDate;

import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.DatePicker;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

public class MainView {

	private final Label weekLabel = new Label();
	private final Label rangeLabel = new Label();
	private DatePicker datePicker;

	public Scene buildScene(){
		BorderPane root = buildRoot();
		Scene s = new Scene(root, 400, 300);
		datePicker.setValue(LocalDate.now());
		return s;
	}

	// Currently empty, but will be used to switch between apps.
	private HBox buildNavbar(){
		return new HBox();
	}

	private HBox buildPresets(){
		return new HBox();
	}

	private HBox buildNavigation(){
		HBox nav = new HBox(20);
		Button leftNav = buildLeftNavButton();
		Button rightNav = buildRightNavButton();
		buildDatePicker();
		nav.getChildren().addAll(leftNav, datePicker, rightNav);

		return nav;
	}

	private Button buildLeftNavButton(){
		Button btn = new Button("←");
		btn.setOnAction(val -> {
			Week current = WeekService.getWeek(datePicker.getValue());
			Week previous = WeekService.getPreviousWeek(current);
			datePicker.setValue(previous.start());
		});
		return btn;
	}

	private Button buildRightNavButton(){
		Button btn = new Button("→");
		btn.setOnAction(val -> {
			Week current = WeekService.getWeek(datePicker.getValue());
			Week next = WeekService.getNextWeek(current);
			datePicker.setValue(next.start());
		});
		return btn;
	}

	private DatePicker buildDatePicker(){
		datePicker = new DatePicker();
		datePicker.setOnAction(val -> {
			System.out.println("Date picked: " + datePicker.getValue());
			LocalDate picked = datePicker.getValue();
			if(picked == null){
				weekLabel.setText("");
				rangeLabel.setText("");
				return;
			}
			Week week = WeekService.getWeek(picked);
			weekLabel.setText("Week " + week.number() + ", " + week.year());
			rangeLabel.setText(week.start() + " - " + week.end());
		});
		return datePicker;
	}

	private VBox buildContent(){
		VBox content = new VBox();
		content.getChildren().addAll(
			buildPresets(),
			buildNavigation(),
			weekLabel,
			rangeLabel
		);
		return content;
	}

	private BorderPane buildRoot(){
		BorderPane root = new BorderPane();
		root.setTop(buildNavbar());
		root.setCenter(buildContent());
		return root;
	}
}
