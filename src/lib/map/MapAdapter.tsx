import { Fragment, PropsWithChildren } from "react";
import MapView, { Marker, Polygon, Region } from "react-native-maps";
import { StyleSheet, View } from "react-native";
import { FieldWithRelations } from "@/src/types/domain";
import { JOB_STATUS_COLORS } from "@/src/constants/status";

type MapAdapterProps = PropsWithChildren<{
  fields: FieldWithRelations[];
  selectedFieldId?: string | null;
  onSelectField: (fieldId: string) => void;
  initialRegion: Region;
}>;

export function MapAdapter({
  fields,
  selectedFieldId,
  onSelectField,
  initialRegion,
  children
}: MapAdapterProps) {
  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        {fields.map((item) => {
          const status = item.job?.status ?? "pending";
          const color = JOB_STATUS_COLORS[status];
          const polygonCoordinates =
            item.field.polygon_geojson.coordinates[0]?.map(([lng, lat]) => ({
              latitude: lat,
              longitude: lng
            })) ?? [];

          return (
            <Fragment key={item.field.id}>
              <Polygon
                coordinates={polygonCoordinates}
                tappable
                strokeColor={color}
                fillColor={`${color}55`}
                strokeWidth={selectedFieldId === item.field.id ? 3 : 2}
                onPress={() => onSelectField(item.field.id)}
              />
              <Marker
                coordinate={{
                  latitude: item.field.center_lat,
                  longitude: item.field.center_lng
                }}
                pinColor={color}
                onPress={() => onSelectField(item.field.id)}
              />
            </Fragment>
          );
        })}
      </MapView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
